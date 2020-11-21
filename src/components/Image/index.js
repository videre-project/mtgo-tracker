import { useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames';
import { usePrefersReducedMotion, useInViewport } from 'hooks';
import prerender from 'utils/prerender';
import { numToMs } from 'utils/style';
import { resolveVideoSrcFromSrcSet } from 'utils/image';
import { useTheme } from 'components/ThemeProvider';
import './index.css';

const Image = ({ className, style, delay = 0, src, ...rest }) => {
  // require returns an ES module in CRA 4
  // https://github.com/facebook/create-react-app/issues/9831
  if (src?.default) src = src.default;

  const [loaded, setLoaded] = useState(false);
  const { themeId } = useTheme();
  const containerRef = useRef();
  const inViewport = useInViewport(containerRef, !src?.endsWith('.mp4'));

  const onLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <div
      className={classNames('image', className, `image--${themeId}`, {
        'image--in-viewport': inViewport,
      })}
      style={{ ...style, '--delay': numToMs(delay) }}
      ref={containerRef}
    >
      <ImageElements
        delay={delay}
        onLoad={onLoad}
        loaded={loaded}
        inViewport={inViewport}
        src={src}
        {...rest}
      />
    </div>
  );
};

const ImageElements = ({
  onLoad,
  loaded,
  inViewport,
  srcSet,
  placeholder,
  delay,
  src,
  alt,
  play = true,
  ...rest
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [placeholderSize, setPlaceholderSize] = useState();
  const [videoSrc, setVideoSrc] = useState();
  const placeholderRef = useRef();
  const videoRef = useRef();
  const isVideo = src?.endsWith('.mp4');
  const imgSrc = src || srcSet?.split(' ')[0];
  const showFullRes = !prerender && inViewport;

  useEffect(() => {
    const purgePlaceholder = () => {
      setShowPlaceholder(false);
    };

    const placeholderElement = placeholderRef.current;
    placeholderElement.addEventListener('transitionend', purgePlaceholder);

    return function cleanUp() {
      if (placeholderElement) {
        placeholderElement.removeEventListener('transitionend', purgePlaceholder);
      }
    };
  }, []);

  useEffect(() => {
    const resolveVideoSrc = async () => {
      const resolvedVideoSrc = await resolveVideoSrcFromSrcSet(srcSet);
      setVideoSrc(resolvedVideoSrc);
    };

    if (isVideo && srcSet) {
      resolveVideoSrc();
    } else if (isVideo) {
      setVideoSrc(src);
    }
  }, [isVideo, src, srcSet]);

  useEffect(() => {
    const { width, height } = placeholderRef.current;

    if (width && height) {
      setPlaceholderSize({ width, height });
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current || !videoSrc) return;

    if (!play || !inViewport) {
      videoRef.current.pause();
    } else if (inViewport && !prefersReducedMotion && !prerender) {
      videoRef.current.play();
    }
  }, [inViewport, play, prefersReducedMotion, videoSrc]);

  const handlePlaceholderLoad = event => {
    const { width, height } = event.target;
    setPlaceholderSize({ width, height });
  };

  return (
    <div
      className={classNames('image__element-wrapper', {
        'image__element-wrapper--in-viewport': inViewport,
      })}
      style={{ '--delay': numToMs(delay + 1000) }}
    >
      {isVideo && (
        <video
          muted
          loop
          playsInline
          className={classNames('image__element', { 'image__element--loaded': loaded })}
          autoPlay={!prefersReducedMotion}
          role="img"
          onLoadStart={onLoad}
          aria-label={alt}
          ref={videoRef}
          {...rest}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
      {!isVideo && (
        <img
          className={classNames('image__element', { 'image__element--loaded': loaded })}
          onLoad={onLoad}
          decoding="async"
          src={showFullRes ? imgSrc : undefined}
          srcSet={showFullRes ? srcSet : undefined}
          width={placeholderSize?.width}
          height={placeholderSize?.height}
          alt={alt}
          {...rest}
        />
      )}
      {showPlaceholder && (
        <img
          aria-hidden
          className={classNames('image__placeholder', {
            'image__placeholder--loaded': loaded,
          })}
          style={{ '--delay': numToMs(delay) }}
          ref={placeholderRef}
          src={placeholder}
          onLoad={handlePlaceholderLoad}
          width={placeholderSize?.width}
          height={placeholderSize?.height}
          decoding="async"
          alt=""
          role="presentation"
        />
      )}
    </div>
  );
};

export default Image;
