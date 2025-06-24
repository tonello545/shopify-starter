# Accelerator theme

[Getting started](#getting-started) |
[Developer tools](#developer-tools) |
[Theme Store submission](#theme-store-submission) |
[Contributing](#contributing) |
[License](#license)

The Accelerator theme is a lightweight, flexible foundation on top of which Shopify themes can be built. It represents a HTML-first, JavaScript-only-as-needed approach to theme development with performance, flexibility, and [Online Store 2.0 features](https://shopify.dev/themes/os20) built-in and acts as a starting point to accelerate the development of Shopify themes.

* **Web-native in its purest form:** Themes run on the [evergreen web](https://www.w3.org/2001/tag/doc/evergreen-web/). We leverage the latest web browsers to their fullest, while maintaining support for the older ones through progressive enhancement—not polyfills.
* **Lean, fast, and reliable:** Functionality and design defaults to “no” until it meets this requirement. Code ships on quality. Themes must be built with purpose. They shouldn’t support each and every feature in Shopify.
* **Server-rendered:** HTML must be rendered by Shopify servers using Liquid. Business logic and platform primitives such as translations and money formatting don’t belong on the client. Async and on-demand rendering of parts of the page is OK, but we do it sparingly as a progressive enhancement.
* **Functional, not pixel-perfect:** The Web doesn’t require each page to be rendered pixel-perfect by each browser engine. Using semantic markup, progressive enhancement, and clever design, we ensure that themes remain functional regardless of the browser.

## Getting started

We recommend using the Accelerator theme as a starting point for theme development. [Learn more on Shopify.dev](https://shopify.dev/themes/getting-started/create). 

> If you're building a theme for the Shopify Theme Store, then you can use the Accelerator theme as a starting point. However, the theme that you submit needs to be [substantively different from the Accelerator theme](https://shopify.dev/themes/store/requirements#uniqueness) so that it provides added value for merchants.

## Developer tools

There are a number of really useful tools that the Shopify Themes team uses during development. The Accelerator theme is already set up to work with these tools.

### Shopify CLI

[Shopify CLI](https://github.com/Shopify/cli) helps you build Shopify themes faster and is used to automate and enhance your local development workflow. It comes bundled with a suite of commands for developing Shopify themes—everything from working with themes on a Shopify store (e.g. creating, publishing, deleting themes) or launching a development server for local theme development.

You can follow this [quick start guide for theme developers](https://shopify.dev/themes/tools/cli) to get started.

### Theme Check

We recommend using [Theme Check](https://github.com/shopify/theme-check) as a way to validate and lint your Shopify themes.

We've added Theme Check to the Accelerator theme's [list of VS Code extensions](/.vscode/extensions.json) so if you're using Visual Studio Code as your code editor of choice, you'll be prompted to install the [Theme Check VS Code](https://marketplace.visualstudio.com/items?itemName=Shopify.theme-check-vscode) extension upon opening VS Code after you've forked and cloned the Accelerator theme.

You can also run it from a terminal with the following Shopify CLI command:

```bash
shopify theme check
```

## Theme Store submission

The [Shopify Theme Store](https://themes.shopify.com/) is the place where Shopify merchants find the themes that they'll use to showcase and support their business. As a theme partner, you can create themes for the Shopify Theme Store and reach an international audience of an ever-growing number of entrepreneurs.

Ensure that you follow the list of [theme store requirements](https://shopify.dev/themes/store/requirements) if you're interested in becoming a [Shopify Theme Partner](https://shopify.dev/themes/store) and building themes for the Shopify platform.

## Contributing

We provide the Accelerator theme in this repository as a way to help new and aspiring theme developers kick-start their build project. It consists of an unstyled theme outline and includes all mandatory features and templates. It meets our code principles, and standards on performance, accessibility and best practises in HTML, CSS and Liquid. However, the code in this repository is not a traditional source-available project.

This theme was developed using clear and concise Liquid, without any superfluous code and is purposefully unstyled to not get in the way of developers' CSS preferences, and to foster creativity. It is a starting point for theme development, and as a result, we **are not accepting contributions that change or add theme features**. 

Though we are not accepting functional contributions, we’d still love to hear from you! If you have ideas for improvement or feedback, please [open an issue on this repository](https://github.com/Shopify/accelerator-theme/issues/new). We will also happily accept pull requests for fixing typos in the documentation. If you do open an issue or pull request on this repository, please read [the code of conduct](.github/CODE_OF_CONDUCT.md), which all contributors must adhere to.

## License

Copyright (c) 2021-present Shopify Inc. See [LICENSE](/LICENSE.md) for further details.
