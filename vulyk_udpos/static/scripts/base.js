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
        select(
            words_wrapper.find("a.word.active").parent().nextAll(".word-wrapper:first"),
            true
        );
    }

    function selectPrev() {
        select(
            words_wrapper.find("a.word.active").parent().prevAll(".word-wrapper:first"),
            true
        );
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
            pos = el.data("pos");

        wrapper.addClass("done").data("pos", pos);
        wrapper.find("a.tag").removeClass("selected");
        el.addClass("selected");

        updateProgress();
        window.setTimeout(selectNext, 0);
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

        console.log("Loaded sentences for UD POS tagging:", sentences);
        output.html(template(sentences));
        words_wrapper = output.find(".word-wrapper");

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
