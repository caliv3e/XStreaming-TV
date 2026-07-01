import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import {Text, Icon, Card, useTheme} from 'react-native-paper';

type Props = {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
  hasTVPreferredFocus?: boolean;
};

const HomeItem: React.FC<Props> = ({
  title,
  icon,
  color,
  onPress,
  hasTVPreferredFocus = false,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);
  const titleStyle = React.useMemo(() => [styles.title, {color}], [color]);
  const cardStyle = React.useMemo(
    () => [styles.card, theme.dark && styles.cardDark],
    [theme.dark],
  );
  const handlePress = () => {
    onPress && onPress();
  };

  const renderContent = (focused = isFocused) => (
    <View style={[styles.focusFrame, focused && styles.focusFrameActive]}>
      {focused && <View pointerEvents="none" style={styles.focusHalo} />}
      <Card
        mode="contained"
        style={[cardStyle, focused && styles.cardFocused]}>
        {focused && (
          <>
            <View pointerEvents="none" style={styles.glassWash} />
            <View pointerEvents="none" style={styles.glassTopSheen} />
            <View pointerEvents="none" style={styles.glassEdgeLight} />
            <View pointerEvents="none" style={styles.glassLiquid} />
            <View pointerEvents="none" style={styles.glassLiquidSmall} />
          </>
        )}
        <Card.Content style={styles.cardContent}>
          <View
            style={[
              styles.iconBubble,
              theme.dark && styles.iconBubbleDark,
              focused && styles.iconBubbleFocused,
            ]}>
            <Icon source={icon} color={color} size={48} />
          </View>
          <View>
            <Text
              variant="labelLarge"
              numberOfLines={1}
              style={[titleStyle, focused && styles.titleFocused]}>
              {title}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  if (Platform.OS === 'android') {
    return (
      <Pressable
        onPress={handlePress}
        android_ripple={{color: 'rgba(255, 255, 255, 0.04)'}}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
        focusable={true}
        hasTVPreferredFocus={hasTVPreferredFocus}
        style={({focused, pressed}: any) => [
          styles.pressable,
          focused && styles.pressableFocused,
          pressed && styles.pressablePressed,
        ]}>
        {({focused}: any) => renderContent(!!focused)}
      </Pressable>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      activeOpacity={0.72}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      focusable={true}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={styles.pressable}>
      {renderContent(isFocused)}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 26,
    padding: 2,
    backgroundColor: 'transparent',
  },
  pressableFocused: {
    backgroundColor: 'rgba(230, 250, 255, 0.16)',
    borderColor: 'rgba(255, 255, 255, 0.92)',
    transform: [{scale: 1.04}],
  },
  pressablePressed: {
    opacity: 0.82,
  },
  focusFrame: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 24,
    padding: 4,
    position: 'relative',
  },
  focusFrameActive: {
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'transparent',
    transform: [{scale: 1.045}],
    shadowColor: '#9CF8FF',
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.45,
    shadowRadius: 30,
  },
  focusHalo: {
    position: 'absolute',
    left: -8,
    right: -8,
    top: -8,
    bottom: -8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(196, 244, 255, 0.48)',
    backgroundColor: 'transparent',
  },
  card: {
    minHeight: 124,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.56)',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    position: 'relative',
  },
  cardDark: {
    backgroundColor: 'rgba(18, 20, 32, 0.84)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowOpacity: 0.32,
  },
  cardFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.82)',
    elevation: 12,
  },
  glassWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(230, 250, 255, 0.07)',
  },
  glassTopSheen: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 8,
    height: 34,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  glassEdgeLight: {
    position: 'absolute',
    left: 1,
    right: 1,
    top: 1,
    bottom: 1,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.48)',
  },
  glassLiquid: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    right: -28,
    top: -24,
    backgroundColor: 'rgba(196, 244, 255, 0.13)',
  },
  glassLiquidSmall: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    left: -20,
    bottom: -24,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  cardContent: {
    minHeight: 124,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  iconBubble: {
    width: 58,
    height: 58,
    borderRadius: 18,
    // backgroundColor: 'rgba(255, 255, 255, 0.34)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconBubbleDark: {
    // backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconBubbleFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.42)',
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
  },
  titleFocused: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.38)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 6,
  },
});

export default HomeItem;
