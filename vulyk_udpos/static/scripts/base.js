/**
 * Vulyk plugin for UD POS tagging.
 *
 * Task format: array of sentences, each sentence is an array of word objects:
 *   [
 *     [{"word": "Це", "pos": "PRON"}, {"word": "речення"}],
 *     [{"word": "Друге"}, {"word": "речення"}, {"word": "."}]
 *   ]
 *
 * Words may have a pre-tagged "pos" field which will be shown as the default selection.
 */
$(function () {
    "use strict";

    var template = Handlebars.compile($("#udpos_template").html()),
        output = $("#out"),
        bar = $(".total-progress"),
        words_wrapper;

    // Register helper for comparing POS tags
    Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
        return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    });

    /**
     * Selects a word wrapper element and optionally opens its dropdown.
     */
    function select(item, toggle) {
        var currentTag;

        if (!item.length) {
            return;
        }

        words_wrapper.find(".active").removeClass("active");
        item.find("a.word").addClass("active");

        if (toggle) {
            window.setTimeout(function () {
                item.find("a.word").dropdown("toggle");
            }, 0);
        }

        currentTag = item.data("pos");
        if (currentTag) {
            item.find("a.tag").removeClass("selected");
            item.find("a.tag[data-pos='" + currentTag + "']")
                .focus()
                .addClass("selected");
        } else if (toggle) {
            window.setTimeout(function () {
                item.find("a.tag").eq(0).focus();
            }, 0);
        }
    }

    function selectNext() {
        var current = words_wrapper.find("a.word.active").parent(),
            next = current.nextAll(".word-wrapper:first");

        // If no next word in current sentence, try first word of next sentence
        if (!next.length) {
            next = current.closest(".sentence").next(".sentence").find(".word-wrapper:first");
        }

        select(next, true);
    }

    function selectPrev() {
        var current = words_wrapper.find("a.word.active").parent(),
            prev = current.prevAll(".word-wrapper:first");

        // If no previous word in current sentence, try last word of previous sentence
        if (!prev.length) {
            prev = current.closest(".sentence").prev(".sentence").find(".word-wrapper:last");
        }

        select(prev, true);
    }

    function updateProgress() {
        var total = words_wrapper.length,
            done = words_wrapper.filter(".done").length;

        if (total === 0) {
            bar.hide();
            return;
        }

        bar.find(".progress-bar").width((done / total * 100) + "%");
    }

    /**
     * Serializes the annotated data for saving.
     * Returns an array of sentences, each containing word objects with word and pos.
     */
    function serialize() {
        var sentences = [];

        output.find(".sentence").each(function () {
            var sentence = [];

            $(this).find(".word-wrapper.done").each(function () {
                var wrapper = $(this);
                sentence.push({
                    word: wrapper.find("a.word").text(),
                    pos: wrapper.data("pos")
                });
            });

            if (sentence.length > 0) {
                sentences.push(sentence);
            }
        });

        return { sentences: sentences };
    }

    // Handle tag selection
    output.on("click", "a.tag", function (e) {
        e.preventDefault();

        var el = $(this),
            wrapper = el.closest(".word-wrapper"),
            pos = el.data("pos"),
            wasAlreadyDone = wrapper.hasClass("done");

        // Remove any existing POS class
        wrapper.removeClass(function (index, className) {
            return (className.match(/\bpos-\S+/g) || []).join(" ");
        });

        // Remove existing POS label
        wrapper.find(".pos-label").remove();

        // Add done state, POS class, and update data
        wrapper.addClass("done pos-" + pos).data("pos", pos);
        wrapper.find("a.tag").removeClass("selected");
        el.addClass("selected");

        // Add new POS label
        wrapper.prepend('<span class="pos-label pos-' + pos + '">' + pos + '</span>');

        updateProgress();

        // Only advance to next word if this was not already tagged
        if (!wasAlreadyDone) {
            window.setTimeout(selectNext, 0);
        }
    });

    // Handle word click
    output.on("click", "a.word", function (e) {
        e.preventDefault();
        select($(this).parent(), false);
    });

    // Keyboard navigation
    key("left", selectPrev);
    key("right", selectNext);

    // Number keys 1-9 for quick tag selection (maps to first 9 tags)
    for (var i = 1; i <= 9; i++) {
        (function (idx) {
            key(String(idx), function () {
                var activeWrapper = words_wrapper.find("a.word.active").parent();
                if (activeWrapper.length) {
                    activeWrapper.find("a.tag").eq(idx - 1).click();
                }
            });
        })(i);
    }

    // 0 maps to 10th tag (PART)
    key("0", function () {
        var activeWrapper = words_wrapper.find("a.word.active").parent();
        if (activeWrapper.length) {
            activeWrapper.find("a.tag").eq(9).click();
        }
    });

    // Vulyk framework events
    $(document.body).on("vulyk.next", function (e, data) {
        var sentences = data.result.task.data;

        output.html(template(sentences));
        words_wrapper = output.find(".word-wrapper");

        // Add POS classes and labels to pre-tagged words
        words_wrapper.filter(".done").each(function () {
            var wrapper = $(this),
                pos = wrapper.data("pos");

            if (pos) {
                wrapper.addClass("pos-" + pos);
                wrapper.prepend('<span class="pos-label pos-' + pos + '">' + pos + '</span>');
            }
        });

        select(words_wrapper.eq(0), true);
        updateProgress();

    }).on("vulyk.save", function (e, callback) {
        var total = words_wrapper.length,
            done = words_wrapper.filter(".done").length;

        if (done === total) {
            callback(serialize());
        } else {
            // Focus on first untagged word
            select(words_wrapper.filter(":not(.done)").eq(0), true);
        }

    }).on("vulyk.skip", function (e, callback) {
        callback();
    });
});
