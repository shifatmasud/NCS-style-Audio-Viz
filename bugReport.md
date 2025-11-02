# Bug & Issue Tracker

## Critical

-   None at the moment.

## Warning

-   **(2024-05-22)**: On very high-frequency audio, the bloom effect can occasionally become overly intense. May need to clamp the `intensity` value in the fragment shader.

## Suggestion

-   **(2024-05-22)**: The file name in the controls section could have a character limit to prevent layout issues with extremely long file names.
-   **(2024-05-22)**: Add a subtle loading indicator while the audio context is being set up after a file is selected.
