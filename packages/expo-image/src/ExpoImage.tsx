import React from 'react';
import { Image, requireNativeComponent, StyleSheet, Platform } from 'react-native';

import { ImageProps } from './Image';

const NativeExpoImage = requireNativeComponent('ExpoImage');

export default function ExpoImage({ source, style, ...props }: ImageProps) {
  const resolvedSource = Image.resolveAssetSource(source ?? {});
  let resolvedStyle = StyleSheet.flatten([style]);

  if (!Array.isArray(resolvedSource)) {
    const { width, height } = resolvedSource;
    resolvedStyle.width = resolvedStyle.width ?? width;
    resolvedStyle.height = resolvedStyle.height ?? height;
  }

  // Shadows behave different on iOS, Android & Web.
  // Android uses the `elevation` prop, whereas iOS
  // and web use the regular `shadow...` props.
  let hasShadows = false;
  if (Platform.OS === 'android') {
    delete resolvedStyle.shadowColor;
    delete resolvedStyle.shadowOffset;
    delete resolvedStyle.shadowOpacity;
    delete resolvedStyle.shadowRadius;
    hasShadows = !!resolvedStyle.elevation;
  } else {
    delete resolvedStyle.elevation;
    hasShadows = !!resolvedStyle.shadowColor;
  }

  // Shadows are rendered quite differently on iOS, Android and web.
  // - iOS renders the shadow along the transparent contours of the image.
  // - Android renders an underlay which extends to the inside of the bounds.
  // - Web renders the shadow only on the outside of the bounds.
  // To achieve a consistent appearance on all platforms, it is highly recommended
  // to set a background-color on the Image when using shadows. This will ensure
  // consistent rendering on all platforms and mitigate Androids drawing artefacts.
  if (hasShadows && !resolvedStyle.backgroundColor) {
    console.warn(
      `"expo-image" Shadows may not be rendered correctly for the transparent parts of images. Set "backgroundColor" to a non-transparent color when using a shadow.`
    );
    // To silence this warning, set background-color to a fully transparent color
  }

  return <NativeExpoImage {...props} source={resolvedSource} style={resolvedStyle} />;
}
