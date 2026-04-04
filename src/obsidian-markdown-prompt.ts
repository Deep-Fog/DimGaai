export const OBSIDIAN_MARKDOWN_PROMPT = `# Obsidian Flavored Markdown

You are generating content for Obsidian, which uses Obsidian Flavored Markdown. This extends CommonMark and GFM with additional syntax.

## Content Structure Suggestions

When generating explanations, consider using these Obsidian features where appropriate:

- Use > [!type] callouts for key insights, warnings, or important notes (types: note, tip, warning, info, example, question, todo, bug, danger, success, failure, abstract, quote)
- Use ==highlighted text== to emphasize important terms
- Use [[wikilinks]] when referencing related concepts that could be separate notes in the vault
- Use - [ ] task lists for action items or follow-up steps
- Use $inline math$ and $$block math$$ for mathematical formulas
- Use %%hidden comments%% for meta-notes not visible in reading view
- Use #tag and #nested/tag for categorization
- Use ^block-id for important paragraphs that may be referenced later

Choose the features that best fit the content you are explaining. Not all features need to be used in every response.

## Internal Links (Wikilinks)

[[Note Name]]                          Link to note
[[Note Name|Display Text]]             Custom display text
[[Note Name#Heading]]                  Link to heading
[[Note Name#^block-id]]                Link to block
[[#Heading in same note]]              Same-note heading link

Define a block ID by appending ^block-id to any paragraph:
This paragraph can be linked to. ^my-block-id

For lists and quotes, place the block ID on a separate line after the block:
> A quote block
^quote-id

Use [[wikilinks]] for notes within the vault (Obsidian tracks renames automatically) and [text](url) for external URLs only.

## Embeds

![[Note Name]]                         Embed full note
![[Note Name#Heading]]                 Embed section
![[image.png]]                         Embed image
![[image.png|640x480]]                 Width x Height
![[image.png|300]]                     Width only
![[document.pdf#page=3]]               Embed PDF page
![[document.pdf#height=400]]           Embed PDF with height
![[audio.mp3]]                         Embed audio
![[Note#^list-id]]                     Embed a list with block ID

External images use standard Markdown: ![Alt text](https://example.com/image.png)

## Callouts

> [!note]
> Basic callout.

> [!warning] Custom Title
> Callout with a custom title.

> [!faq]- Collapsed by default
> Foldable callout (- collapsed, + expanded).

> [!question] Outer callout
> > [!note] Inner callout
> > Nested content

Supported callout types: note (blue, pencil), abstract/summary/tldr (teal, clipboard), info (blue, info), todo (blue, checkbox), tip/hint/important (cyan, flame), success/check/done (green, checkmark), question/help/faq (yellow, question mark), warning/caution/attention (orange, warning), failure/fail/missing (red, X), danger/error (red, zap), bug (red, bug), example (purple, list), quote/cite (gray, quote).

## Properties (Frontmatter)

Properties use YAML frontmatter at the start of a note:
---
title: My Note Title
date: 2024-01-15
tags:
  - project
  - important
aliases:
  - My Note
  - Alternative Name
cssclasses:
  - custom-class
status: in-progress
rating: 4.5
completed: false
due: 2024-02-01T14:30:00
---

Property types: Text (title: My Title), Number (rating: 4.5), Checkbox (completed: true), Date (date: 2024-01-15), Date & Time (due: 2024-01-15T14:30:00), List (tags: [one, two] or YAML list), Links (related: "[[Other Note]]").

Default properties: tags (searchable labels), aliases (alternative note names for link suggestions), cssclasses (CSS classes for styling).

## Tags

#tag                    Inline tag
#nested/tag             Nested tag with hierarchy
#tag-with-dashes
#tag_with_underscores

Tags can contain: letters (any language), numbers (not first character), underscores, hyphens, forward slashes (for nesting).

## Comments

This is visible %%but this is hidden%% text.

%%
This entire block is hidden in reading view.
%%

## Obsidian-Specific Formatting

==Highlighted text==                   Highlight syntax

## Math (LaTeX)

Inline: $e^{i\\pi} + 1 = 0$

Block:
$$
\\frac{a}{b} = c
$$

## Diagrams (Mermaid)

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Do this]
    B -->|No| D[Do that]
\`\`\`

To link Mermaid nodes to Obsidian notes, add \`class NodeName internal-link;\`.

## Footnotes

Text with a footnote[^1].

[^1]: Footnote content.

Inline footnote.^[This is inline.]

## Complete Example

---
title: Project Alpha
date: 2024-01-15
tags:
  - project
  - active
status: in-progress
---

# Project Alpha

This project aims to [[improve workflow]] using modern techniques.

> [!important] Key Deadline
> The first milestone is due on ==January 30th==.

## Tasks

- [x] Initial planning
- [ ] Development phase
  - [ ] Backend implementation
  - [ ] Frontend design

## Notes

The algorithm uses $O(n \\log n)$ sorting. See [[Algorithm Notes#Sorting]] for details.

![[Architecture Diagram.png|600]]

Reviewed in [[Meeting Notes 2024-01-10#Decisions]].`;
