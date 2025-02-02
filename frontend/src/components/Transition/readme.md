# Transition
Encapsulate your components in a transition component to reveal it with one of the available transition types.

Makes revealing stuff (in a cool way) easy
| Prop | Purpose |
| :-- | :-- |
|type| Determines what transition is used. Available types are of type `TransitionType`: `wipe`, `diagonal`, and `fade` |
|toggle| Sets the on or off state of the transition. Toggle = on, contents shown. Toggle = off, contents hidden.  |
|forceStyle|Of type `React.CSSProperties`. Is used to force a style on the transition container.|
|forceClass|Forces the given CSS class onto the transition container|
|transitionSpeedMS|Determines how quickly the transition happens (in milliseconds). Note: if `fps` is too high, the transition speed may be a lot slower than specified. |
|fps|The number of frames per second for the transition. Lower fps = choppier transitions, and higher fps = smoother transitions. Please note: `fps` being too high results in the transition speed being much lower than `transitionSpeedMS`.|
|delay|The before and after delay of the transition responding to toggle changes. Note: Cannot be used in combination with delayBefore or delayAfter.|
|delayBefore|The before delay of transition. Read `delay` for important note.|
|delayAfter|The after delay of transition. Read `delay` for important note.|
|direction|Currently only used for the wipe transition. Specifies the direction of the wipe.|
|hideOnToggleOff|When toggle is false, the transition will remove itself from the DOM.|

<mark>**Note**: DO NOT IMPORT INIVIDUAL TRANSITIONS DIRECTLY (e.g.: WipeTransition).</mark> Use `Transition` and specify a transition `type` instead.
### Transition: Wipe
Shows contents by expanding diagonally. Specify `direction` to control the direction of the wipe.

### Transition: Fade
Shows contents by increasing its opacity.

