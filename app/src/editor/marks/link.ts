import { Functionality, isModKey } from '../functionality';
import { Plugin } from 'prosemirror-state';
import { InputRule } from 'prosemirror-inputrules';
import { toggleMark } from 'prosemirror-commands';

export default class Link extends Functionality {
  onClickLink: (href: string) => void;

  constructor(onClickLink) {
    super();
    this.onClickLink = onClickLink;
  }

  mark() {
    return {
      name: "link",
      schema: {
        attrs: {
          href: { default: "" },
        },
        inclusive: false,
        toDOM: (node) => ["a", { href: node.attrs.href, rel: "noopener noreferrer nofollow" }, 0],
        parseDOM: [ { tag: "a", getAttrs(dom) { return { href: dom.href } } } ],
      }
    }
  }

  keys(schema) {
    return {
      "Mod-[": (state, dispatch) => {
        const { doc, selection } = state;
        if (selection.empty) { return false; }
        let href = null;

        /*
         * Toggling non-inclusive marks when nothing is selected isn't meaningful, so check that a selection has
         * been made. Also ask the user for a URL.
         */
        if (!doc.rangeHasMark(selection.from, selection.to, schema.marks.link)) {
          // TODO: we probably want to replace prompt with our own menu
          href = prompt("Link to where?", "");
          if (!href) { return false; }
        }

        return toggleMark(schema.marks.link, { href })(state, dispatch);
      }
    }
  }

  inputRules(schema) {
    return [
      new InputRule(/\[(.+)]\((\S+)\)/, (state, match, start, end) => {
        const [okay, alt, href] = match;
        const { tr } = state;

        if (okay) {
          tr.replaceWith(start, end, schema.text(alt))
            .addMark(start, start + alt.length, schema.marks.link.create({ href }));
        }

        return tr;
      }),
    ];
  }

  plugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            click: (view, event: MouseEvent) => {
              // Require the ctrl/meta key to click to allow easier editing
              if (!isModKey(event)) {
                return false;
              }

              if (event.target instanceof HTMLAnchorElement) {
                /*
                 * We access the `href` manually using `getAttribute` (instead of `event.target.href`) because we
                 * want to preserve nice internal URLs (e.g. `/zettel/{whatever}`), whereas `HTMLAnchorElement`
                 * provides a `href` relative to the current location.
                 */
                // TODO: this still isn't perfect - if the user enters a URL like `google.com`, this is interpreted
                // by the browser as being relative to the current page. I think the simplest way to solve this
                // would be to add a 'https://' if there isn't already one or a '/'.
                const href = event.target.getAttribute("href");

                if (this.onClickLink) {
                  event.stopPropagation();
                  event.preventDefault();
                  this.onClickLink(href);
                  return true;
                }
              }

              return false;
            },
          },
        },
      }),
    ];
  }
}
