# Theme

This folder integrates theming support for [Semantic
UI](https://semantic-ui.com/) into our project. The approach was to start with
[Semantic-UI-LESS](https://github.com/Semantic-Org/Semantic-UI-LESS) and
integrate just what was needed into our codebase. This wasn't our first choice,
but the options we previously tried (such as those [documented
here](https://react.semantic-ui.com/theming/)) didn't work. Integrating theming
was necessary though because trying to get the right visual style by overriding
CSS styles on top of the builtin Semantic UI was proving excruciating.

Our theme is located at `semantic.maslow.css`. **DO NOT MAKE MANUAL EDITS TO
THIS FILE.** It is the output of compiling the `semantic.less` with the Less
compiler. Any manual changes you make to this file will be lost.

## Compiling the theme

If you make any changes to files under `src/theme`, you will need to compile the
theme and check in the resulting changes to `semantic.maslow.css`. The theme is
not compiled automatically as part of our build. It is a manual step.

To build the theme, it's just:

```js
yarn theme
```

Building the theme is NOT automatically integrated into `yarn build` or `yarn start`. If you edit the theme (that is, any file under `src/theme`), you will
need to run `yarn theme` and check in the changed `semantic.maslow.css` (just
like you do when you update `package.json` and have to check in `yarn.lock`).

## Changing the theme

There is a distinction between _editing the theme_ and _styling custom
components_ within our app. The theme defines the global baseline for the visual
style of the app, but you will still need to define styles for custom
components. Add a custom CSS module to a component, say, when you want to change
the location of a button on a specific custom component. Edit the theme when you
want to change the visual appearance of the Semantic UI button everywhere.

The theme is written in [Less](http://lesscss.org/) and is written as site
customizations of the default theme. All customizations should appear under the
`_site` folder. Do not edit any file under the `theme` folder. All edits should
appear in the appropriate `*.variables` (for defining or overriding the value of
Less variables) or `*.overrides` (for defining or overriding CSS styles).

## Fonts

The fonts under `_site/assets/fonts` are encrypted and must be decrypted before
use. See the README in the `_site/assets/fonts` folder for more informatoin.
