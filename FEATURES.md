# New Feature Brain Dump

## Journaling Meals with LLMs
We should want jounaling meals to be as pain-free as possible. To this end, we should look to offer multiple means by which to record, ranging from quick to precise.

### Talk to text to journal
The first and quickest option. For the user, this would look like hitting a button (lucide microphone icon?) to record a meal, and talking into their device. From there, we would transcribe the speech, then walk through a flow of converting that plain text to our Food/Meal/FoodInstance/MealInstance structure. Once converted, we show the user to have them confirm or edit, and then save as we normally would.

#### Build Steps
- [x] very zen journal view: record button at the bottom + transcibed text, editable when not actively recording, centered in the view; submit button to submit the text
- [x] implement audio recording: use browser MediaRecorder API or Web Speech API for speech-to-text transcription; handle microphone permissions and errors gracefully
- [x] create API endpoint `/api/fuel/meals/transcribe` to process transcription: accepts transcription text, calls OpenAI to parse, handles food/meal creation, returns MealInstance for confirmation
- [x] implement fuzzy matching logic: create helper functions to search existing Foods and Meals by name (use existing `searchFoods` as base, add similar for meals); determine similarity threshold (e.g., Levenshtein distance or string similarity); check if parsed meal/foods already exist before creating new ones
- [x] build OpenAI prompt in `mealPrompt.ts`: create structured prompt that instructs OpenAI to parse meal descriptions into JSON matching our types (Food, PortionedFood, Meal, MealInstance); include examples; specify JSON schema with required fields; handle edge cases (missing portions, ambiguous foods, etc.)
- [x] enhance OpenAI integration: update `callOpenAI` to support JSON mode/structured output; add error handling for API failures; add retry logic for transient errors
- [x] take response from OpenAI and submit to dedicated endpoint to 1) create new Foods and Meal, if needed, or do nothing if Foods and Meal are already present in db (via fuzzy matching)
- [x] create confirmation/editing UI component: display parsed MealInstance with all foods and portions; allow user to edit portions, add/remove foods, modify meal name; provide "trust and save" option to skip editing; reuse existing MealInstanceForm or create new component
- [x] handle date/timestamp from transcription: parse relative time references ("just ate", "30 minutes ago", "breakfast", "lunch", "dinner") or explicit times from transcription; default to current time if not specified (handled in OpenAI prompt)
- [x] add loading states: show loading indicators during transcription, OpenAI processing, and database operations; disable UI appropriately during async operations
- [x] error handling: handle transcription failures (no speech detected, API errors); handle OpenAI parsing failures (invalid JSON, missing required fields); handle database errors (duplicate creation attempts, validation failures); show user-friendly error messages
- [x] meal logged success view: show success confirmation after meal is saved; optionally redirect to meal log or show summary of what was logged
- [x] navigation/routing: determine where this feature lives (new route like `/fuel/voice-log` or integrated into existing RecordTab); handle navigation after completion

### Image to journal

### Barcode to journal

### Manual entry
Already exists. woot.