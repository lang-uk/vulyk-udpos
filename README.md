# Vulyk UD POS Tagging Plugin

A simplified crowdsourcing plugin for Universal Dependencies (UD) Part-of-Speech tagging.

## Files

- `vulyk_udpos/static/scripts/base.js` — Main plugin JavaScript
- `vulyk_udpos/templates/base.html` — HTML template with styling and test harness
- `tasks.jsonl` — Sample tasks for testing (Ukrainian sentences)

## Task Data Format

Tasks are provided as JSONL (JSON Lines) format. Each line contains a task object with a `data` field.

The `data` field is an **array of sentences**, where each sentence is an **array of word objects**.

### Word Object Structure

```json
{
    "word": "Київ",
    "pos": "PROPN"    // optional: pre-tagged POS
}
```

- `word` (required): The word/token text
- `pos` (optional): Pre-tagged UD POS tag. If provided, the word will be shown as already tagged.

### Example Task

```json
{
    "data": [
        [
            {"word": "Київ", "pos": "PROPN"},
            {"word": "є"},
            {"word": "столицею"},
            {"word": "України"},
            {"word": "."}
        ],
        [
            {"word": "Це"},
            {"word": "велике"},
            {"word": "місто"},
            {"word": "."}
        ]
    ]
}
```

## UD POS Tagset

The plugin uses the standard 17 Universal Dependencies POS tags:

| Tag    | Description (EN)             | Опис (UK)                |
|--------|------------------------------|--------------------------|
| ADJ    | adjective                    | прикметник               |
| ADP    | adposition                   | прийменник               |
| ADV    | adverb                       | прислівник               |
| AUX    | auxiliary                    | допоміжне дієслово       |
| CCONJ  | coordinating conjunction     | сурядний сполучник       |
| DET    | determiner                   | детермінатив             |
| INTJ   | interjection                 | вигук                    |
| NOUN   | noun                         | іменник                  |
| NUM    | numeral                      | числівник                |
| PART   | particle                     | частка                   |
| PRON   | pronoun                      | займенник                |
| PROPN  | proper noun                  | власна назва             |
| PUNCT  | punctuation                  | пунктуація               |
| SCONJ  | subordinating conjunction    | підрядний сполучник      |
| SYM    | symbol                       | символ                   |
| VERB   | verb                         | дієслово                 |
| X      | other                        | інше                     |

## Keyboard Shortcuts

| Key       | Action                              |
|-----------|-------------------------------------|
| ←         | Previous word                       |
| →         | Next word                           |
| 1-9, 0    | Quick tag selection (first 10 tags) |
| Enter     | Confirm selection in dropdown       |

## Output Format

When a task is saved, the plugin returns:

```json
{
    "sentences": [
        [
            {"word": "Київ", "pos": "PROPN"},
            {"word": "є", "pos": "AUX"},
            {"word": "столицею", "pos": "NOUN"},
            {"word": "України", "pos": "PROPN"},
            {"word": ".", "pos": "PUNCT"}
        ],
        [
            {"word": "Це", "pos": "PRON"},
            {"word": "велике", "pos": "ADJ"},
            {"word": "місто", "pos": "NOUN"},
            {"word": ".", "pos": "PUNCT"}
        ]
    ]
}
```

## Integration with Vulyk

The plugin listens for these Vulyk framework events:

- `vulyk.next` — Receives new task data and renders the UI
- `vulyk.save` — Validates that all words are tagged and returns serialized data
- `vulyk.skip` — Allows skipping the current task

## Dependencies

- jQuery 2.x+
- Bootstrap 3.x (for dropdown functionality)
- Handlebars.js (for template compatibility, though templates are built in JS)
- Keymaster.js (for keyboard shortcuts)
