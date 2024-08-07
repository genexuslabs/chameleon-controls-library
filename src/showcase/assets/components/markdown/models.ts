export const markdownReadmeModel = `Chameleon Markdown Parser
========================

The [ch-markdown] control lets you convert [Markdown] into HTML. Markdown is a simple text format whose goal is to be very easy to read and write, even when not converted to HTML.  This demo page will let you type anything you like and see how it gets converted.  Live.  No more waiting around.

## Table of content
Based on [Markdown basic syntax](https://www.markdownguide.org/basic-syntax/)

* [Why Markdown?](#why-markdown)
* [How To Use The Demo](#how-to-use-the-demo)
* [Basic syntax](#basic)
  - [Headings](#headings)
  - [Alternative headings](#alternative-headings)
  - [Paragraphs](#paragraphs)
  - [Line Breaks](#line-break)
  - [Emphasis](#emphasis)
    + [Bold](#bold)
    + [Italic](#italic)
    + [Bold and Italic](#bold-and-italic)
  - [Blockquotes](#blockquotes)
    + [Blockquotes with Multiple Paragraphs](#blockquotes-with-multiple-paragraphs)
    + [Nested Blockquotes](#nested-blockquotes)
    + [Blockquotes with Other Elements](#blockquotes-with-other-elements)
  - [Lists](#lists)
    + [Ordered Lists](#ordered-lists)
    + [Unordered Lists](#unordered-lists)
    + [Starting Ordered List Items with Numbers](#starting-ordered-list-items-with-numbers)
  - [Adding Elements in Lists](#adding-elements-in-lists)
    + [Paragraphs](#starting-ordered-list-items-with-numbers-paragraphs)
    + [Blockquotes](#starting-ordered-list-items-with-numbers-blockquotes)
    + [Code Blocks](#starting-ordered-list-items-with-numbers-code-blocks)
    + [Images](#starting-ordered-list-items-with-numbers-images)
    + [Lists](#starting-ordered-list-items-with-numbers-lists)
  - [Inline Code](#inline-code)
    + [Escaping Backticks](#escaping-backticks)
  - [Code block](#code-block)
    + [Syntax Highlighting](#syntax-highlighting)
  - [Horizontal Rules](#horizontal-rules)
  - [Links](#links)
    + [Adding Titles](#links-adding-titles)
    + [URLs and Email Addresses](#links-urls-and-email-addresses)
    + [Formatting Links](#links-formatting-links)
    + [Reference-style Links](#links-reference-style-links)
      * [Formatting the First Part of the Link](#links-formatting-the-first-part-of-the-link)
      * [Formatting the Second Part of the Link](#links-formatting-the-second-part-of-the-link)
      * [An Example Putting the Parts Together](#links-an-example-putting-the-parts-together)
  - [Images](#images)
    + [Linking Images](#linking-images)
  - [Escaping Characters](#escaping-characters)


* [GitHub flavored markdown (GFM)](#gfm)

## Why Markdown? {#why-markdown}

It's easy.  It's not overly bloated, unlike HTML.  Also, as the creator of [markdown] says,

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.

[ch-markdown]: https://github.com/genexuslabs/chameleon-controls-library
[Markdown]: https://www.markdownguide.org/extended-syntax/

## How To Use The Demo {#how-to-use-the-demo}

1. 👈 Type in stuff on the left.
2. 👉 See the live updates on the right.

## Basic syntax {#basic}

### Headings {#headings}
To create a heading, add number signs (\`#\`) in front of a word or phrase. The number of number signs you use should correspond to the heading level. For example, to create a heading level three (\`<h3>\`), use three number signs (e.g., \`### My Header\`).

# Heading level 1
## Heading level 2
### Heading level 3
#### Heading level 4
##### Heading level 5
###### Heading level 6

### Alternative headings {#alternative-headings}
Alternatively, on the line below the text, add any number of \`==\` characters for heading level 1 or \`--\` characters for heading level 2.

Heading level 1
===

Heading level 2
---

### Paragraphs {#paragraphs}
To create paragraphs, use a blank line to separate one or more lines of text.

### Line Breaks {#line-break}
To create a line break or new line (\`<br>\`), end a line with two or more spaces, and then type return.

Text example 1.\
Text example 2 in the same paragraph.

Text example 3 in a new paragraph.
Text example 4 in the same paragraph.

### Emphasis {#emphasis}
You can add emphasis by making text bold or italic.

#### Bold {#bold}
To bold text, add two asterisks or underscores before and after a word or phrase. To bold the middle of a word for emphasis, add two asterisks without spaces around the letters.

I just love **bold text**.

I just love __bold text__.

Love**is**bold

#### Italic {#italic}
To italicize text, add one asterisk or underscore before and after a word or phrase. To italicize the middle of a word for emphasis, add one asterisk without spaces around the letters.

Italicized text is the *cat's meow*.

Italicized text is the _cat's meow_.

A*cat*meow

#### Bold and Italic {#bold-and-italic}
To emphasize text with bold and italics at the same time, add three asterisks or underscores before and after a word or phrase. To bold and italicize the middle of a word for emphasis, add three asterisks without spaces around the letters.

This text is ***really important***.

This text is ___really important___.

This text is __*really important*__.

This text is **_really important_**.

This is really***very***important text.

### Blockquotes {#blockquotes}
To create a blockquote, add a \`>\` in front of a paragraph.

> Lorem ipsum dolor sit amet consectetur adipisicing elit.

#### Blockquotes with Multiple Paragraphs {#blockquotes-with-multiple-paragraphs}
Blockquotes can contain multiple paragraphs. Add a \`>\` on the blank lines between the paragraphs.

> Lorem ipsum dolor sit amet consectetur adipisicing elit.
> 
> Asperiores iusto quasi exercitationem at suscipit, recusandae doloremque accusantium, eveniet delectus omnis harum voluptatum est, possimus nesciunt fugit autem! Sapiente, similique libero.

#### Nested Blockquotes {#nested-blockquotes}
Blockquotes can be nested. Add a \`>>\` in front of the paragraph you want to nest.

> Lorem ipsum dolor sit amet consectetur adipisicing elit.
> 
>> Asperiores iusto quasi exercitationem at suscipit, recusandae doloremque accusantium, eveniet delectus omnis harum voluptatum est, possimus nesciunt fugit autem!
>
> Sapiente, similique libero.

####  Blockquotes with Other Elements {#blockquotes-with-other-elements}
Blockquotes can contain other Markdown formatted elements. Not all elements can be used — you'll need to experiment to see which ones work.

> #### The quarterly results look great!
>
> - Revenue was off the chart.
> - Profits were higher than ever.
>
>  *Everything* is going according to **plan**.

### Lists {#lists}
You can organize items into ordered and unordered lists.

#### Ordered Lists {#ordered-lists}
To create an ordered list, add line items with numbers followed by periods. The numbers don’t have to be in numerical order, but the list should start with the number one.

**Example 1:**
1. First item
2. Second item
3. Third item
4. Fourth item

**Example 2:**
1. First item
1. Second item
1. Third item
1. Fourth item

**Example 3:**
1. First item
8. Second item
3. Third item
5. Fourth item

**Example 4:**
1. First item
2. Second item
3. Third item
    1. Indented item
    2. Indented item
4. Fourth item

**Example 5:**

6. First item
7. Second item
8. Third item
    1. Indented item
    2. Indented item
9. Fourth item

#### Unordered Lists {#unordered-lists}
To create an unordered list, add dashes (\`-\`), asterisks (\`*\`), or plus signs (\`+\`) in front of line items. Indent one or more items to create a nested list.

**Example 1:**
- First item
- Second item
- Third item
- Fourth item

**Example 2:**
* First item
* Second item
* Third item
* Fourth item

**Example 3:**
+ First item
+ Second item
+ Third item
+ Fourth item

**Example 4:**
- First item
- Second item
- Third item
    - Indented item
    - Indented item
- Fourth item

**Example 5:**
- First item
- Second item
- Third item
    - Indented item
    - Indented item
- Fourth item
  + Indented item
  + Indented item
    * Indented item
    + Indented item
  + Indented item
  - Indented item

#### Starting Ordered List Items with Numbers {#starting-ordered-list-items-with-numbers}
If you need to start an ordered list item with a number followed by a period, you can use a backslash (\`\\\`) to escape the period.

1. 1968\. A great year!
2. I think 1969 was second best.

### Adding Elements in Lists {#adding-elements-in-lists}
To add another element in a list while preserving the continuity of the list, indent the element four spaces or one tab, as shown in the following examples.

**Important:** If things don't appear the way you expect, double check that you've indented the elements in the list four spaces or one tab.

#### Paragraphs {#starting-ordered-list-items-with-numbers-paragraphs}
* This is the first list item.
* Here's the second list item.

    I need to add another paragraph below the second list item.

* And here's the third list item.

#### Blockquotes {#starting-ordered-list-items-with-numbers-blockquotes}
* This is the first list item.
* Here's the second list item.

    > A blockquote would look great below the second list item.

* And here's the third list item.

#### Code Blocks {#starting-ordered-list-items-with-numbers-code-blocks}
1. Open the file.
2. Find the following code block on line 21:
   \`\`\`javascript
   const hello = "Hello world!";
   console.log(hello);
   \`\`\`
3. Update the title to match the name of your website.

#### Images {#starting-ordered-list-items-with-numbers-images}
1. Open the file containing the Angular logo.
2. Marvel at its beauty.

    ![Angular logo](showcase/pages/assets/icons/angular.svg)

3. Close the file.

#### Lists {#starting-ordered-list-items-with-numbers-lists}
You can nest an unordered list in an ordered list, or vice versa.

1. First item
2. Second item
3. Third item
    - Indented item
    - Indented item
4. Fourth item

### Inline Code {#inline-code}
To denote a word or phrase as code, enclose it in backticks (\` \`\` \`).

At the command prompt, type \`nano\`.

#### Escaping Backticks {#escaping-backticks}
If the word or phrase you want to denote as code includes one or more backticks, you can escape it by enclosing the word or phrase in double backticks (\` \`\` \`).

\`\`Use \`code\` in your Markdown file.\`\`

### Code block {#code-block}
To create code blocks, you’ll use three backticks (\` \`\`\` \`) or three tildes (\`~~~\`) on the lines before and after the code block.

\`\`\`
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
\`\`\`

Another way to create code blocks is to indent every line of the block by at least four spaces or one tab.

    <html>
      <head>
      </head>
    </html>


#### Syntax Highlighting {#syntax-highlighting}
This feature allows you to add color highlighting for whatever language your code was written in.
To add syntax highlighting, specify a language next to the backticks before the fenced code block.

\`\`\`json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
\`\`\`

\`\`\`javascript
import React from 'react'
import ReactDOM from 'react-dom'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

const markdown = \`
# Your markdown here
\`

ReactDOM.render(
  <Markdown rehypePlugins={[rehypeHighlight]}>{markdown}</Markdown>,
  document.querySelector('#content')
)
\`\`\`

### Horizontal Rules {#horizontal-rules}
To create a horizontal rule, use three or more asterisks (\`***\`), dashes (\`---\`), or underscores (\`___\`) on a line by themselves.

Asterisks:

***

Dashes:

---

Underscores:
_________________

### Links {#links}
To create a link, enclose the link text in brackets (e.g., \`[ch-markdown]\`) and then follow it immediately with the URL in parentheses (e.g., \`(https://github.com/genexuslabs/chameleon-controls-library)\`).

My favorite markdown viewer is [ch-markdown](https://github.com/genexuslabs/chameleon-controls-library).

#### Adding Titles {#links-adding-titles}
You can optionally add a title for a link. This will appear as a tooltip when the user hovers over the link. To add a title, enclose it in quotation marks after the URL.

My favorite markdown viewer is [ch-markdown](https://github.com/genexuslabs/chameleon-controls-library "The best markdown viewer").

#### URLs and Email Addresses {#links-urls-and-email-addresses}
To quickly turn a URL or email address into a link, enclose it in angle brackets \`<>\`.

<https://github.com/genexuslabs/chameleon-controls-library>

<jdoe@example.com>

#### Formatting Links {#links-formatting-links}
To emphasize links, add asterisks before and after the brackets and parentheses. To denote links as code, add backticks in the brackets.

I love the **[ch-markdown control](https://github.com/genexuslabs/chameleon-controls-library)**.

This is the *[ch-markdown readme](https://github.com/genexuslabs/chameleon-controls-library)*.

See the section on [\`code\`](#code).

#### Reference-style Links {#links-reference-style-links}
Reference-style links are a special kind of link that make URLs easier to display and read in Markdown. Reference-style links are constructed in two parts: the part you keep inline with your text and the part you store somewhere else in the file to keep the text easy to read.

##### Formatting the First Part of the Link {#links-formatting-the-first-part-of-the-link}
The first part of a reference-style link is formatted with two sets of brackets. The first set of brackets surrounds the text that should appear linked. The second set of brackets displays a label used to point to the link you’re storing elsewhere in your document.

Although not required, you can include a space between the first and second set of brackets. The label in the second set of brackets is not case sensitive and can include letters, numbers, spaces, or punctuation.

This means the following example formats are roughly equivalent for the first part of the link:

  - \`[hobbit-hole][1]\`
  - \`[hobbit-hole] [1]\`

##### Formatting the Second Part of the Link {#links-formatting-the-second-part-of-the-link}
The second part of a reference-style link is formatted with the following attributes:

 1. The label, in brackets, followed immediately by a colon and at least one space (e.g., \`[label]:\` ).
 2. The URL for the link, which you can optionally enclose in angle brackets.
 3. The optional title for the link, which you can enclose in double quotes, single quotes, or parentheses.

This means the following example formats are all roughly equivalent for the second part of the link:

  - \`[1]: https://en.wikipedia.org/wiki/Hobbit#Lifestyle\`
  - \`[1]: https://en.wikipedia.org/wiki/Hobbit#Lifestyle "Hobbit lifestyles"\`
  - \`[1]: https://en.wikipedia.org/wiki/Hobbit#Lifestyle 'Hobbit lifestyles'\`
  - \`[1]: https://en.wikipedia.org/wiki/Hobbit#Lifestyle (Hobbit lifestyles)\`
  - \`[1]: <https://en.wikipedia.org/wiki/Hobbit#Lifestyle> "Hobbit lifestyles"\`
  - \`[1]: <https://en.wikipedia.org/wiki/Hobbit#Lifestyle> 'Hobbit lifestyles'\`
  - \`[1]: <https://en.wikipedia.org/wiki/Hobbit#Lifestyle> (Hobbit lifestyles)\`

You can place this second part of the link anywhere in your Markdown document. Some people place them immediately after the paragraph in which they appear while other people place them at the end of the document (like endnotes or footnotes).

##### An Example Putting the Parts Together {#links-an-example-putting-the-parts-together}
Say you add a URL as a standard URL link to a paragraph and it looks like this in Markdown:

\`\`\`
In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends
of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to
eat: it was a [hobbit-hole](https://en.wikipedia.org/wiki/Hobbit#Lifestyle "Hobbit lifestyles"), and that means comfort.
\`\`\`

Though it may point to interesting additional information, the URL as displayed really doesn’t add much to the existing raw text other than making it harder to read. To fix that, you could format the URL like this instead:

\`\`\`
In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends
of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to
eat: it was a [hobbit-hole][1], and that means comfort.

[1]: <https://en.wikipedia.org/wiki/Hobbit#Lifestyle> "Hobbit lifestyles"
\`\`\`

In both instances above, the rendered output would be identical:

> In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends
> of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to
> eat: it was a [hobbit-hole](https://en.wikipedia.org/wiki/Hobbit#Lifestyle "Hobbit lifestyles"), and that means comfort.

> In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends
> of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to
> eat: it was a [hobbit-hole][1], and that means comfort.

[1]: <https://en.wikipedia.org/wiki/Hobbit#Lifestyle> "Hobbit lifestyles"


### Images {#images}
To add an image, add an exclamation mark (\`!\`), followed by alt text in brackets, and the path or URL to the image asset in parentheses. You can optionally add a title in quotation marks after the path or URL.

![Old angular logo](showcase/pages/assets/icons/angular.svg "Old angular logo")

#### Linking Images {#linking-images}
To add a link to an image, enclose the Markdown for the image in brackets, and then add the link in parentheses.

[![Old angular logo](showcase/pages/assets/icons/angular.svg "Old angular logo")](https://blog.angular.io/introducing-angular-v17-4d7033312e4b)

### Escaping Characters {#escaping-characters}
To display a literal character that would otherwise be used to format text in a Markdown document, add a backslash (\`\\\`) in front of the character.

\* Without the backslash, this would be a bullet in an unordered list.

Characters you can escape:

| Character | Name |
| --        | :--   |
| \\ | backslash |
| \` | backtick |
| * | asterisk |
| _ | underscore |
| { } | curly braces |
| [ ] | brackets |
| < > | angle brackets |
| ( ) | parentheses |
| # | pound sign |
| + | plus sign |
| - | minus sign (hyphen) |
| . | dot |
| ! | exclamation mark |
| \\| | pipe |

## GitHub flavored markdown (GFM) {#gfm}
`;
