# CSS Components

This project is a collection of reusable CSS components designed to streamline the development of web applications. The components are organized into various categories for easy access and maintenance.

## Project Structure

- **src/base**: Contains foundational styles including resets, typography, and variables.
  - `reset.css`: CSS reset styles for consistent rendering across browsers.
  - `typography.css`: Defines typography styles such as font sizes and line heights.
  - `variables.css`: CSS variables for colors, font families, and other reusable values.

- **src/components**: Contains styles for individual UI components.
  - `buttons.css`: Styles for button components with different states (hover, active).
  - `cards.css`: Styles for card components, including layout and hover effects.
  - `media.css`: Styles for media elements like images and videos.
  - `layout.css`: Layout-related styles, including grid and flexbox utilities.

- **src/layouts**: Contains layout styles for responsive designs.
  - `grid.css`: Grid layout styles with responsive breakpoints.
  - `flex.css`: Flexbox layout styles for flexible designs.

- **src/utils**: Utility classes for common CSS tasks.
  - `spacing.css`: Utility classes for margin and padding.
  - `helpers.css`: Helper classes for text alignment and visibility.

- **src/main.css**: The main stylesheet that imports all other stylesheets and applies global styles.

## Usage

To use the components in your project, import the necessary CSS files into your main stylesheet or directly into your HTML files.

## Installation

To install the project dependencies, run:

```bash
npm install
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.