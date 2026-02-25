"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeTitle = sanitizeTitle;
exports.sanitizeContent = sanitizeContent;
exports.sanitizeComment = sanitizeComment;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
function sanitizeTitle({ value }) {
    if (typeof value !== 'string')
        return value;
    return (0, sanitize_html_1.default)(value, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
    });
}
function sanitizeContent({ value }) {
    if (typeof value !== 'string')
        return value;
    return (0, sanitize_html_1.default)(value, {
        allowedTags: [
            'b',
            'i',
            'u',
            'strong',
            'em',
            's',
            'strike',
            'p',
            'br',
            'div',
            'h1',
            'h2',
            'h3',
            'ul',
            'ol',
            'li',
            'a',
            'img',
        ],
        allowedAttributes: {
            a: ['href', 'target', 'rel'],
            img: ['src', 'alt', 'class', 'loading'],
            '*': ['style'],
        },
        allowedStyles: {
            '*': {
                'text-align': [/^left$/, /^center$/, /^right$/],
            },
        },
        allowedSchemes: ['http', 'https'],
        allowedSchemesByTag: {
            img: ['http', 'https'],
            a: ['http', 'https'],
        },
        transformTags: {
            a: (tagName, attribs) => {
                return {
                    tagName,
                    attribs: {
                        ...attribs,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                    },
                };
            },
        },
        disallowedTagsMode: 'discard',
    });
}
function sanitizeComment({ value }) {
    if (typeof value !== 'string')
        return value;
    return (0, sanitize_html_1.default)(value, {
        allowedTags: ['b', 'i', 'u', 'strong', 'em'],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
    });
}
//# sourceMappingURL=sanitize.util.js.map