import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {Text, useTheme} from 'react-native-paper';

type Props = {
  titleItem: any;
  onPress: (titleItem: any) => any;
  compact?: boolean;
};

const TitleItem: React.FC<Props> = ({titleItem, onPress, compact = false}) => {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [isFocused, setIsFocused] = React.useState(false);

  const handlePress = () => {
    onPress && onPress(titleItem);
  };

  const renderImage = () => {
    if (!titleItem) {
      return null;
    }
    if (!titleItem.Image_Tile && !titleItem.Image_Poster) {
      return null;
    }
    const url = titleItem.Image_Tile
      ? titleItem.Image_Tile.URL
      : titleItem.Image_Poster.URL;

    if (url) {
      return (
        <Image
          source={{
            uri: 'https:' + url,
          }}
          resizeMode={'cover'}
          onLoad={() => setLoading(false)}
          style={[styles.image, compact && styles.imageCompact]}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      focusable={true}
      android_ripple={{color: 'rgba(255,255,255,0.18)'}}
      style={[styles.pressable, isFocused && styles.pressableFocused]}>
      <View
        style={[
          styles.card,
          compact && styles.cardCompact,
          isFocused && styles.cardFocused,
        ]}>
        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator
              size={compact ? 'small' : 'large'}
              color={theme.colors.primary}
            />
          </View>
        )}
        {renderImage()}
        {isFocused && (
          <>
            <View pointerEvents="none" style={styles.focusGlassWash} />
            <View pointerEvents="none" style={styles.focusGlassSheen} />
            <View pointerEvents="none" style={styles.focusGlassRim} />
            <View pointerEvents="none" style={styles.focusGlassPool} />
          </>
        )}
        <View
          style={[
            styles.descriptionContainer,
            compact && styles.descriptionContainerCompact,
          ]}>
          <Text
            style={[styles.description, compact && styles.descriptionCompact]}
            numberOfLines={compact ? 1 : 2}
            ellipsizeMode="tail">
            {titleItem.ProductTitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 12,
    margin: 4,
    padding: 1,
  },
  pressableFocused: {
    transform: [{scale: 1.035}],
    elevation: 14,
    shadowColor: '#9CF8FF',
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.42,
    shadowRadius: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(140, 140, 150, 0.38)',
    borderRadius: 8,
    margin: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  cardCompact: {
    margin: 5,
    borderColor: 'rgba(140, 140, 150, 0.28)',
  },
  cardFocused: {
    borderColor: 'rgba(255, 255, 255, 0.92)',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  loadingWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 150,
  },
  imageCompact: {
    height: 104,
  },
  descriptionContainer: {
    padding: 10,
    zIndex: 3,
    backgroundColor: 'rgba(8, 12, 22, 0.54)',
  },
  descriptionContainerCompact: {
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  description: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0,
    color: '#FFFFFF',
  },
  descriptionCompact: {
    fontSize: 11,
  },
  focusGlassWash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    backgroundColor: 'rgba(220, 255, 255, 0.08)',
  },
  focusGlassSheen: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 9,
    height: 30,
    borderRadius: 16,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  focusGlassRim: {
    position: 'absolute',
    left: 1,
    right: 1,
    top: 1,
    bottom: 1,
    zIndex: 2,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.52)',
  },
  focusGlassPool: {
    position: 'absolute',
    right: -26,
    bottom: 18,
    width: 82,
    height: 82,
    borderRadius: 41,
    zIndex: 2,
    backgroundColor: 'rgba(148, 250, 129, 0.18)',
  },
});

export default TitleItem;
