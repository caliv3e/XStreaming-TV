import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Platform,
  Dimensions,
  TouchableNativeFeedback,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Menu,
  IconButton,
  useTheme,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {SvgXml} from 'react-native-svg';
import icons from '../common/svg';
import {getSettings} from '../store/settingStore';

const ConsoleItem = (props: any) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const settings = getSettings();

  const [menuVisible, setMenuVisible] = React.useState(false);
  const [actionFocused, setActionFocused] = React.useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const consoleItem = props.consoleItem;
  const {width} = Dimensions.get('window');
  const isWide = width > 600;
  const shouldPowerOnAndStream =
    settings.power_on && consoleItem.powerState === 'ConnectedStandby';
  const actionTitle = shouldPowerOnAndStream
    ? t('Power on and start stream')
    : t('Start stream');
  const handleActionPress = shouldPowerOnAndStream
    ? props.onPoweronStream
    : props.onPress;

  const renderImage = () => {
    const type = consoleItem.consoleType;
    if (type === 'XboxSeriesX') {
      return (
        <Image
          source={require('../assets/console/series-x.png')}
          style={[styles.consoleImage, isWide && styles.consoleImageWide]}
          resizeMode="contain"
        />
      );
    } else if (type === 'XboxSeriesS') {
      return (
        <Image
          source={require('../assets/console/series-s.png')}
          style={[styles.consoleImage, isWide && styles.consoleImageWide]}
          resizeMode="contain"
        />
      );
    } else {
      return <SvgXml xml={icons.ConsoleIcon} width={'100%'} height={80} />;
    }
  };

  return (
    <Card mode="contained" style={[styles.card, theme.dark && styles.cardDark]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.menuContainer}>
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <IconButton icon="dots-vertical" size={24} onPress={openMenu} />
            }>
            <Menu.Item
              onPress={() => {
                closeMenu();
                props.onPoweron && props.onPoweron();
              }}
              title={t('Powered on')}
            />
            <Menu.Item
              onPress={() => {
                closeMenu();
                props.onPoweroff && props.onPoweroff();
              }}
              title={t('Powered off')}
            />
          </Menu>
        </View>

        <View style={styles.consoleInfos}>
          <Text variant="titleLarge" style={styles.textCenter}>
            {consoleItem.deviceName}
          </Text>
          {/* <Divider /> */}
          <View style={styles.image}>{renderImage()}</View>
          <View>
            <Text variant="titleMedium" style={styles.textCenter}>
              {consoleItem.consoleType}
            </Text>
            <Text
              variant="labelSmall"
              style={[
                styles.textCenter,
                styles.serverId,
                theme.dark && styles.serverIdDark,
              ]}>
              ({consoleItem.serverId})
            </Text>
            {consoleItem.powerState === 'On' ? (
              <Text style={[styles.green, styles.textCenter]}>
                {t('Powered on')}
              </Text>
            ) : consoleItem.powerState === 'ConnectedStandby' ? (
              <Text style={[styles.yellow, styles.textCenter]}>
                {t('Standby')}
              </Text>
            ) : (
              <Text style={[styles.red, styles.textCenter]}>
                {consoleItem.powerState}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.footer}>
          {Platform.OS === 'android' ? (
            <TouchableNativeFeedback
              onPress={handleActionPress}
              onFocus={() => setActionFocused(true)}
              onBlur={() => setActionFocused(false)}
              background={TouchableNativeFeedback.Ripple(
                'rgba(148, 250, 129, 0.5)',
                false,
              )}
              useForeground={true}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={actionTitle}
              focusable={true}
              hasTVPreferredFocus={props.hasTVPreferredFocus}>
              <View
                style={[
                  styles.nativeActionButton,
                  theme.dark && styles.nativeActionButtonDark,
                  actionFocused && styles.nativeActionButtonFocused,
                ]}>
                {actionFocused && (
                  <>
                    <View
                      pointerEvents="none"
                      style={styles.nativeActionGlassWash}
                    />
                    <View
                      pointerEvents="none"
                      style={styles.nativeActionGlassSheen}
                    />
                    <View
                      pointerEvents="none"
                      style={styles.nativeActionGlassBubble}
                    />
                  </>
                )}
                <Text
                  variant="labelLarge"
                  numberOfLines={1}
                  style={[
                    styles.nativeActionButtonText,
                    actionFocused && styles.nativeActionButtonTextFocused,
                  ]}>
                  {actionTitle}
                </Text>
              </View>
            </TouchableNativeFeedback>
          ) : shouldPowerOnAndStream ? (
            <Button
              mode={Platform.isTV ? 'elevated' : 'outlined'}
              style={[
                styles.actionButton,
                theme.dark && styles.actionButtonDark,
              ]}
              labelStyle={styles.actionButtonLabel}
              onPress={props.onPoweronStream}>
              {t('Power on and start stream')}
            </Button>
          ) : (
            <Button
              mode={Platform.isTV ? 'elevated' : 'outlined'}
              style={[
                styles.actionButton,
                theme.dark && styles.actionButtonDark,
              ]}
              labelStyle={styles.actionButtonLabel}
              onPress={props.onPress}>
              {t('Start stream')}
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
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
    shadowRadius: 24,
  },
  cardDark: {
    backgroundColor: 'rgba(18, 20, 32, 0.84)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowOpacity: 0.32,
  },
  cardContent: {
    padding: 16,
  },
  green: {
    color: '#36B728',
  },
  yellow: {
    color: '#D1BE02',
  },
  red: {
    color: '#dc2626',
  },
  image: {},
  consoleImage: {
    width: '100%',
    height: 130,
  },
  consoleImageWide: {
    height: 150,
  },
  textCenter: {
    textAlign: 'center',
  },
  serverId: {
    color: 'rgba(120, 120, 136, 0.88)',
  },
  serverIdDark: {
    color: 'rgba(214, 216, 232, 0.62)',
  },
  consoleInfos: {},
  footer: {
    paddingTop: 10,
  },
  actionButton: {
    borderColor: 'rgba(16, 124, 16, 0.42)',
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  actionButtonDark: {
    borderColor: 'rgba(110, 235, 131, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  actionButtonLabel: {
    marginHorizontal: 0,
    fontWeight: '700',
  },
  nativeActionButton: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  nativeActionButtonDark: {
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  nativeActionButtonFocused: {
    borderColor: 'rgba(255, 255, 255, 0.92)',
    backgroundColor: 'rgba(180, 255, 235, 0.18)',
    transform: [{scale: 1.03}],
    elevation: 14,
    shadowColor: '#9CF8FF',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.38,
    shadowRadius: 22,
  },
  nativeActionGlassWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  nativeActionGlassSheen: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 5,
    height: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
  },
  nativeActionGlassBubble: {
    position: 'absolute',
    right: -18,
    bottom: -22,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
  },
  nativeActionButtonText: {
    color: '#107C10',
    fontWeight: '700',
    textAlign: 'center',
    zIndex: 1,
  },
  nativeActionButtonTextFocused: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.36)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 5,
  },
  footerControl: {
    marginHorizontal: 2,
    backgroundColor: 'red',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
});

export default ConsoleItem;
