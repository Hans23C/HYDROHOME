import { useState, Fragment } from 'react';

const APPLE_EMOJI_CDN =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64';

/**
 * Convierte un emoji Unicode (incluyendo secuencias ZWJ o variation selectors)
 * a su código hexadecimal unificado compatible con emoji-datasource-apple.
 */
const emojiToUnified = (emoji, keepVariationSelector = true) => {
  const codePoints = [];
  for (const char of emoji) {
    const cp = char.codePointAt(0);
    if (cp === undefined) continue;
    if (!keepVariationSelector && cp === 0xfe0f) continue;
    codePoints.push(cp.toString(16).toLowerCase());
  }
  return codePoints.join('-');
};

/**
 * Renderiza un emoji individual con estética Apple (iOS) desde CDN oficial
 * y fallback automático al carácter nativo si no hay conexión o falla la carga.
 */
export const AppleEmoji = ({
  emoji,
  size = 18,
  className = '',
  alt,
}) => {
  const [stripFe0f, setStripFe0f] = useState(false);
  const [fallbackNative, setFallbackNative] = useState(false);

  if (!emoji) return null;

  const unified = emojiToUnified(emoji, !stripFe0f);

  if (fallbackNative || !unified) {
    return (
      <span
        role="img"
        aria-label={alt || emoji}
        className={`inline-block align-middle leading-none select-none ${className}`}
        style={{ fontSize: `${size}px` }}
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={`${APPLE_EMOJI_CDN}/${unified}.png`}
      alt={alt || emoji}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => {
        if (!stripFe0f && emoji.includes('\uFE0F')) {
          setStripFe0f(true);
        } else {
          setFallbackNative(true);
        }
      }}
      className={`inline-block align-text-bottom object-contain select-none pointer-events-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

const EMOJI_GRAPH_REGEX =
  /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/gu;

const segmentarTexto = (text) => {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return text.split(EMOJI_GRAPH_REGEX).filter(Boolean);
};

/**
 * Procesa cualquier cadena de texto reemplazando todos los emojis inline
 * por componentes <AppleEmoji /> sin alterar el resto del texto.
 */
export const AppleEmojiText = ({ text = '', size = 18, emojiClassName = '' }) => {
  if (!text) return null;

  const segmentos = segmentarTexto(text);

  return (
    <>
      {segmentos.map((seg, index) => {
        if (/\p{Extended_Pictographic}/u.test(seg)) {
          return (
            <AppleEmoji
              key={`ae-${index}-${seg}`}
              emoji={seg}
              size={size}
              className={`mx-[1px] ${emojiClassName}`}
            />
          );
        }
        return <Fragment key={`tx-${index}`}>{seg}</Fragment>;
      })}
    </>
  );
};

export default AppleEmoji;
