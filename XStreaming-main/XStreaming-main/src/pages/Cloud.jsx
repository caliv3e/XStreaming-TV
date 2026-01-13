import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Platform,
  BackHandler,
} from 'react-native';
import {
  Text,
  SegmentedButtons,
  Appbar,
  Chip,
  Portal,
  Modal,
  Card,
} from 'react-native-paper';
import Spinner from '../components/Spinner';
import {useSelector} from 'react-redux';
import TitleItem from '../components/TitleItem';
import XcloudApi from '../xCloud';
import Empty from '../components/Empty';
// import mockData from '../mock/data';
import {debugFactory} from '../utils/debug';
import {useTranslation} from 'react-i18next';
import {
  getXcloudData,
  saveXcloudData,
  isxCloudDataValid,
} from '../store/xcloudStore';

const log = debugFactory('CloudScreen');

function CloudScreen({navigation, route}) {
  const {t, i18n} = useTranslation();
  const streamingTokens = useSelector(state => state.streamingTokens);

  const currentLanguage = i18n.language;

  // log.info('streamingTokens:', streamingTokens);

  const [current, setCurrent] = React.useState(0);
  const [numColumns, setNumColumns] = React.useState(2);
  const [currentPage, setCurrentPage] = React.useState(1);

  const [loading, setLoading] = React.useState(false);
  const [loadmoring, setLoadmoring] = React.useState(false);
  const [isLimited, setIsLimited] = React.useState(false);
  const [showToturial, setShowToturial] = React.useState(false);
  const [titles, setTitles] = React.useState([]);
  const [newTitles, setNewTitles] = React.useState([]);
  const [titlesMap, setTitlesMap] = React.useState({});
  const [recentTitles, setRecentTitles] = React.useState([]);
  const [orgTitles, setOrgTitles] = React.useState([]);
  const [keyword, setKeyword] = React.useState('');
  const flatListRef = React.useRef(null);
  const isFetchGame = React.useRef(false);

  const currentTitles = React.useRef([]);
  const totalPage = React.useRef(0);

  // Handle hardware back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (Platform.isTV) {
        navigation.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [navigation]);

  React.useEffect(() => {
    if (route.params?.keyword) {
      setKeyword(route.params.keyword);
    }
    if (!streamingTokens.xCloudToken) {
      setIsLimited(true);
    }
    const fetchGames = (silent = false) => {
      if (silent) {
        log.info('Fetch games silent');
      }
      if (streamingTokens.xCloudToken) {
        const _xCloudApi = new XcloudApi(
          streamingTokens.xCloudToken.getDefaultRegion().baseUri,
          streamingTokens.xCloudToken.data.gsToken,
          'cloud',
        );

        !silent && setLoading(true);
        _xCloudApi.getTitles().then(res => {
          // log.info('_xCloudApi.getTitles res: ', titles);
          if (res.results) {
            _xCloudApi.getGamePassProducts(res.results).then(_titles => {
              setTitles(_titles);

              const _titleMap = {};
              const _orgTitles = [];

              const _orgMap = {};

              _titles.forEach(item => {
                _titleMap[item.productId] = item;

                // Get org games
                if (
                  !item.XCloudTitleId &&
                  item.details &&
                  item.details.programs &&
                  item.details.programs.indexOf('BYOG') > -1
                ) {
                  if (!_orgMap[item.ProductTitle]) {
                    _orgTitles.push(item);
                    _orgMap[item.ProductTitle] = true;
                  }
                }
              });

              setTitlesMap(_titleMap);
              setOrgTitles(_orgTitles);

              // Get new games
              _xCloudApi.getNewTitles().then(newTitleRes => {
                const _newTitles = [];
                newTitleRes.forEach(item => {
                  if (
                    item.id &&
                    _titleMap[item.id] &&
                    (_titleMap[item.id].titleId ||
                      _titleMap[item.id].XCloudTitleId)
                  ) {
                    _newTitles.push(_titleMap[item.id]);
                  }
                });
                setNewTitles(_newTitles);

                // Get recent games
                _xCloudApi.getRecentTitles().then(recentTitleRes => {
                  const results = recentTitleRes.results || [];
                  const _recentTitles = [];
                  results.forEach(item => {
                    if (item.details && item.details.productId) {
                      const productId = item.details.productId;
                      const productIdUp = productId.toUpperCase();
                      if (_titleMap[productId] || _titleMap[productIdUp]) {
                        _recentTitles.push(
                          _titleMap[productId] || _titleMap[productIdUp],
                        );
                      }
                    }
                  });
                  setRecentTitles(_recentTitles);
                  setLoading(false);
                  isFetchGame.current = true;

                  // update cache
                  saveXcloudData({
                    titles: _titles,
                    titleMap: _titleMap,
                    newTitles: _newTitles,
                    orgTitles: _orgTitles,
                    recentTitles: _recentTitles,
                  });
                });
              });
            });
          }
        });
      }
    };
    if (!isFetchGame.current) {
      // Get xcloud data from cache
      const cacheData = getXcloudData();
      if (cacheData && isxCloudDataValid(cacheData)) {
        log.info('Get xcloud data from cache');
        let {
          titles: _titles,
          titleMap: _titleMap,
          newTitles: _newTitles,
          orgTitles: _orgTitles,
          recentTitles: _recentTitles,
        } = cacheData;

        // Filter duplicate titles

        setTitles(_titles);
        setTitlesMap(_titleMap);
        setNewTitles(_newTitles);
        setOrgTitles(_orgTitles);
        setRecentTitles(_recentTitles);

        // Update silent
        fetchGames(true);
      } else {
        fetchGames();
      }
    }

    const updateLayout = () => {
      const {width} = Dimensions.get('window');
      if (width < 800) {
        setNumColumns(2);
      } else if (width >= 800 && width < 1500) {
        setNumColumns(4);
      } else if (width >= 1500) {
        setNumColumns(8);
      }
    };

    updateLayout();
    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => {
      subscription?.remove();
    };
  }, [route.params?.keyword, streamingTokens.xCloudToken, navigation]);

  const handleViewDetail = titleItem => {
    navigation.navigate('TitleDetail', {titleItem});
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({animated: true, offset: 0});
  };

  const loadMoreData = () => {
    if (currentPage <= totalPage.current) {
      setLoadmoring(true);
      setCurrentPage(currentPage + 1);
      setTimeout(() => {
        setLoadmoring(false);
      }, 1500);
    } else {
      setLoadmoring(false);
    }
  };

  const footLoading = () => {
    if (loadmoring) {
      return (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loadingIndicator}
        />
      );
    } else {
      return null;
    }
  };

  const handleSelectCategories = val => {
    setCurrent(val);
    setLoading(true);
    setCurrentPage(1);
    scrollToTop();
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const renderTutorial = () => {
    return (
      <Portal>
        <Modal
          visible={showToturial}
          onDismiss={() => {
            setShowToturial(false);
          }}
          contentContainerStyle={{marginLeft: '10%', marginRight: '10%'}}>
          <Card>
            <Card.Content>
              <Text variant="bodyMedium">
                如果你在中国大陆地区，因为云游戏服务器均在海外，云游戏延迟和丢包率高都是正常现象，
                如果你需要使用加速器提升云游戏质量，请按照以下操作顺序加速云游戏。
              </Text>
              <Text variant="bodyMedium" style={{marginTop: 10}}>
                1. 打开XStreaming，设置 - 云游戏 -
                地区选择日本或韩国，哪个地区地理位置离你近就选哪个，选择后记得保存，此时XStreaming会重启一次。
              </Text>
              <Text variant="bodyMedium" style={{marginTop: 10}}>
                2.
                重启后进入云游戏栏目，选择你需要玩的游戏，开始，等待连接，待连接成功显示游戏画面后，
                将XStreaming切到后台（注意不是直接杀掉APP进程）。
              </Text>
              <Text variant="bodyMedium" style={{marginTop: 10}}>
                3. 打开加速器，选择加速『XStreaming』，点击加速，等待加速成功。
              </Text>
              <Text variant="bodyMedium" style={{marginTop: 10}}>
                4.
                返回XStreaming，此时你就会发现延迟和丢包都下来了（此时你会看到丢帧比较多，不用紧张，这是因为先进了游戏，未加速时的丢帧比较多，该数值是累计的，等加速稳定后这个数据会降下去），
                云游戏加速成功。
              </Text>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    );
  };

  /**
   * 0 - recent
   * 1 - new
   * 2 - own
   * 3 - all
   */
  switch (current) {
    case 0:
      currentTitles.current = recentTitles;
      break;
    case 1:
      currentTitles.current = newTitles;
      break;
    case 2:
      currentTitles.current = orgTitles;
      break;
    case 3:
      currentTitles.current = titles;
      break;
    default:
      currentTitles.current = [];
      break;
  }

  if (keyword.length > 0) {
    currentTitles.current = currentTitles.current.filter(title => {
      return (
        title.ProductTitle.toUpperCase().indexOf(keyword.toUpperCase()) > -1
      );
    });
  }

  if (currentTitles.current.length > 0) {
    totalPage.current = Math.ceil(currentTitles.current.length / 20);
  }

  // Show 20 titles per page
  const endIdx = currentPage * 20;
  let showTitles = currentTitles.current.slice(0, endIdx);

  return (
    <>
      <Spinner loading={loading} text={t('Loading...')} />

      {!isLimited && (
        <>
          <View style={styles.gameContainer}>
            <Appbar.Header statusBarHeight={0}>
              <Appbar.Content
                title={
                  <SegmentedButtons
                    value={current}
                    onValueChange={handleSelectCategories}
                    buttons={[
                      {
                        value: 0,
                        label: t('Recently'),
                      },
                      {
                        value: 1,
                        label: t('Newest'),
                      },
                      {
                        value: 2,
                        label: t('Own'),
                      },
                      {value: 3, label: t('All')},
                    ]}
                  />
                }
              />
              <Appbar.Action
                icon="magnify"
                onPress={() => {
                  navigation.navigate('Search', {
                    keyword,
                  });
                }}
              />
            </Appbar.Header>

            {(currentLanguage === 'zh' || currentLanguage === 'zht') && (
              <Text
                variant="labelMedium"
                style={styles.tutorialText}
                onPress={() => {
                  setShowToturial(true);
                }}>
                🚀点击查看云游戏加速指引
              </Text>
            )}

            {keyword && (
              <View style={styles.search}>
                <Chip
                  icon="cloud-search-outline"
                  onClose={() => setKeyword('')}>
                  {keyword}
                </Chip>
              </View>
            )}

            {!loading && !showTitles.length && <Empty />}

            {showTitles.length > 0 && (
              <>
                <FlatList
                  ref={flatListRef}
                  data={showTitles}
                  numColumns={numColumns}
                  key={numColumns}
                  contentContainerStyle={styles.listContainer}
                  renderItem={({item}) => {
                    return (
                      <View
                        style={
                          numColumns === 2 ? styles.listItemH : styles.listItemV
                        }>
                        <TitleItem
                          titleItem={item}
                          onPress={handleViewDetail}
                        />
                      </View>
                    );
                  }}
                  onEndReached={loadMoreData}
                  onEndReachedThreshold={0.1}
                  ListFooterComponent={footLoading}
                />
              </>
            )}
          </View>
        </>
      )}

      {renderTutorial()}

      {isLimited && (
        <View style={styles.container}>
          <View>
            <Text style={styles.tips} category="s1">
              {t('NoXGP')}
            </Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tips: {
    textAlign: 'center',
    lineHeight: 30,
  },
  gameContainer: {
    flex: 1,
  },
  categoryWrap: {
    width: 200,
    padding: 10,
  },
  listContainer: {},
  listItemH: {
    width: '50%',
    justifyContent: 'center',
  },
  listItemV: {
    width: '25%',
    justifyContent: 'center',
  },
  loadingIndicator: {
    padding: 20,
  },
  search: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  tutorialText: {
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 10,
  },
});

export default CloudScreen;
