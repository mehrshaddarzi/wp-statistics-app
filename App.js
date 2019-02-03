import React from 'react';
import {View, TextInput, AsyncStorage, Alert, Linking, StyleSheet, Image} from 'react-native';
import {StackNavigator} from 'react-navigation';
import {
    Container,
    Header,
    Content,
    Footer,
    FooterTab,
    Icon,
    Button,
    Title,
    Subtitle,
    Text,
    Form,
    Item,
    Input,
    Label,
    List,
    ListItem,
    Thumbnail,
    Body,
    Card,
    CardItem,
    Left,
    Right
} from 'native-base';
import PureChart from 'react-native-pure-chart';

// Include styles
var styles = require('./src/styles/Style');

class HomeScreen extends React.Component {
    static navigationOptions = {
        title: 'Websites',
    };

    constructor() {
        super();

        this.state = {
            websites: []
        };

        AsyncStorage.getItem('websites').then((value) => {
            const data = JSON.parse(value);

            this.setState({websites: data})
        });

        // Navigate to Show stats
        AsyncStorage.getItem('currentWebsite').then((value) => {
            //this.props.navigation.navigate('ShowStats')
        });
    }

    showStats = (data) => {
        // Set current website
        AsyncStorage.setItem('currentWebsite', JSON.stringify(data));

        this.props.navigation.navigate('ShowStats')
    }

    renderElement() {
        if (this.state.websites)
            return (
                <List dataArray={this.state.websites}
                      renderRow={(item) =>
                          <ListItem>
                              <Text onPress={() => this.showStats(item)}>{item.url}</Text>
                          </ListItem>
                      }>
                </List>
            );
        return (
            <View style={{alignSelf: 'center', alignItems: 'center', marginTop: 50}}>
                <Icon style={{fontSize: 100, color: '#8e8e8e'}} name="ios-sad-outline"/>
                <Text style={{color: '#8e8e8e'}}>Please add a website</Text>
                <Icon style={{color: '#8e8e8e'}} name="ios-arrow-down"/>
            </View>
        );
    }

    render() {
        return (
            <Container>
                <Content>
                    {this.renderElement()}
                </Content>

                <Footer>
                    <FooterTab>
                        <Button onPress={() => this.props.navigation.navigate('AddWebsite')}>
                            <Icon name="md-add-circle"/>
                        </Button>
                    </FooterTab>
                </Footer>
            </Container>
        );
    }
}

class AddNewWebsiteScreen extends React.Component {
    static navigationOptions = {
        title: 'Add new website',
    };

    constructor() {
        super();

        this.state = {}
    }

    onPress = () => {
        // Check the fields
        if (!this.state.url || !this.state.auth_key) {
            Alert.alert(
                'Error',
                'Please complete the fields.',
            )

            return;
        }

        // Store the data
        AsyncStorage.getItem('websites').then((value) => {
            var data = JSON.parse(value);

            if (data == null) {
                var data = [{url: this.state.url, auth_key: this.state.auth_key}]
            } else {
                data.push({url: this.state.url, auth_key: this.state.auth_key});
            }

            AsyncStorage.setItem('websites', JSON.stringify(data)).then((val) => {
                this.setState({
                    url: '',
                    auth_key: ''
                })

                this.props.navigation.navigate('Home')
            })
        });
    };

    render() {
        return (
            <Container>
                <Content>
                    <Form>
                        <Item>
                            <Icon active name='link'/>
                            <Input placeholder={'Website URL'} onChangeText={(url) => this.setState({url})}
                                   keyboardType={"url"} value={this.state.url}/>
                        </Item>
                        <Item last>
                            <Icon active name='key'/>
                            <Input placeholder={'Auth Code'} onChangeText={(auth_key) => this.setState({auth_key})}
                                   keyboardType={"default"} value={this.state.auth_key}/>
                        </Item>
                    </Form>

                    <View style={{flex: 1, width: '90%', alignSelf: "center", marginTop: 20}}>
                        <Button onPress={() => this.onPress()} block rounded>
                            <Text>Add</Text>
                        </Button>
                    </View>

                    <View style={{flex: 1, width: '90%', alignSelf: "center", marginTop: 20}}>
                        <Card>
                            <CardItem header>
                                <Icon active name='ios-information-circle-outline'/>
                                <Text>Information</Text>
                            </CardItem>
                            <CardItem>
                                <Body>
                                <Text onPress={() => {
                                    Linking.openURL('https://goo.gl/h11oeK')
                                }}>Please keep in mind, to connect to the website, the REST API Add-On needs to be
                                    installed on your WordPress.</Text>
                                </Body>
                            </CardItem>
                        </Card>
                    </View>
                </Content>
            </Container>
        );
    }
}

class ShowStatsScreen extends React.Component {
    static navigationOptions = {
        title: 'Stats',
    };

    constructor() {
        super();

        this.state = {
            selectedTab: 'summary',
            stats: {
                userOnline: 0,
            }
        }

        AsyncStorage.getItem('currentWebsite').then((value) => {
            var data = JSON.parse(value);

            this.getSummaryDataFromAPI(data)
        });
    }

    getSummaryDataFromAPI(data) {
        fetch(data.url + '/wp-json/wpstatistics/v1/summary?token_auth=' + data.auth_key)
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    stats: {
                        userOnline: responseJson.user_online,
                        todayVisitors: responseJson.visitors.today,
                        todayVisits: responseJson.visits.today,
                        yesterdayVisitors: responseJson.visitors.yesterday,
                        yesterdayVisits: responseJson.visits.yesterday,
                        weekVisitors: responseJson.visitors.week,
                        weekVisits: responseJson.visits.week,
                        monthVisitors: responseJson.visitors.month,
                        monthVisits: responseJson.visits.month,
                        yearVisitors: responseJson.visitors.year,
                        yearVisits: responseJson.visits.year,
                        totalVisitors: responseJson.visitors.total,
                        totalVisits: responseJson.visits.total,
                    }
                })
            })
            .catch((error) => {
                alert(error + '\r\n' + data.url + '\r\nPlease make sure the website is available.')
            });

        fetch(data.url + '/wp-json/wpstatistics/v1/visitors?token_auth=' + data.auth_key)
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    stats: {
                        visitorsCount: responseJson,
                    }
                })
            })
            .catch((error) => {
                alert(error + '\r\n' + data.url + '\r\nPlease make sure the website is available.')
            });
    }

    renderSelectedTab() {
        var items = ['192.168.29.10', 'Nathaniel Clyne', 'Dejan Lovren', 'Mama Sakho', 'Emre Can', 'Emre Can', 'Emre Can', 'Emre Can', 'Emre Can', 'Emre Can'];

        var visitors = (
            <Content>
                <List dataArray={items}
                      renderRow={(item) =>
                          <ListItem>
                              <Body>
                              <Text>
                                  <Image
                                      source={{uri: 'http://localhost/wordpress/wp-content/plugins/wp-statistics/assets/images/flags/US.png'}}
                                      style={{width: 16, height: 16, marginTop: 5}}/>
                                  <Image
                                      source={{uri: 'http://localhost/wordpress/wp-content/plugins/wp-statistics/assets/images/Chrome.png'}}
                                      style={{width: 16, height: 16, marginTop: 5}}/>

                                  <Text style={{fontSize: 13}}>{item}</Text>
                              </Text>
                              <Text note>https://www.google.com</Text>
                              </Body>
                              <Right>
                                  <Text note>February 7, 2018</Text>
                              </Right>
                          </ListItem>
                      }>
                </List>
            </Content>
        );

        if (this.state.stats.visitorsCount) {
            var visitorData = []

            this.state.stats.visitorsCount.map((VisitorObject) => {
                visitorData.push(
                    {x: VisitorObject.date, y: VisitorObject.count}
                )
            });
        }

        let chartData = [
            {
                seriesName: 'series1',
                data: [
                    {x: '2018-02-01', y: 30},
                    {x: '2018-02-02', y: 200},
                    {x: '2018-02-03', y: 170},
                    {x: '2018-02-04', y: 250},
                    {x: '2018-02-05', y: 110},
                    {x: '2018-02-05', y: 140},
                    {x: '2018-02-05', y: 320},
                    {x: '2018-02-05', y: 430},
                    {x: '2018-02-05', y: 320},
                    {x: '2018-02-05', y: 100},
                    {x: '2018-02-05', y: 700}
                ],
                color: '#ED6E85'
            },
            {
                seriesName: 'series2',
                data: [
                    {x: '2018-02-01', y: 20},
                    {x: '2018-02-02', y: 100},
                    {x: '2018-02-03', y: 140},
                    {x: '2018-02-04', y: 550},
                    {x: '2018-02-05', y: 40}
                ],
                color: '#54A1E5'
            }
        ]

        //console.log('chartData')
        //console.log(chartData)
        //console.log('chartData')
        //console.log(visitorData)

        console.log(this.state)

        var summary = (
            <Content style={{flex: 1, width: '90%', alignSelf: 'center'}}>
                <View style={{alignSelf: "center"}}>
                    <Text style={styles.heading_1}>{this.state.stats.userOnline}</Text>
                    <Text style={[styles.baseText, styles.textCenter]}>Online Users</Text>
                </View>

                <View style={{flex: 1, paddingTop: 20, alignSelf: 'center'}}>
                    <View style={{flex: 1, flexDirection: 'row', paddingBottom: 5}}>
                        <View style={{width: '25%'}}></View>
                        <View style={{width: '37.5%', alignItems: 'center'}}><Text
                            style={styles.baseText}>Visitors</Text></View>
                        <View style={{width: '37.5%', alignItems: 'center'}}><Text style={styles.baseText}>Visits</Text></View>
                    </View>

                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10}}><Text
                            style={styles.baseText}>Today:</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.todayVisitors}</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.todayVisits}</Text></View>
                    </View>

                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10}}><Text
                            style={styles.baseText}>Yesterday:</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.yesterdayVisitors}</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.yesterdayVisits}</Text></View>
                    </View>

                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10}}><Text
                            style={styles.baseText}>Week:</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.weekVisitors}</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.weekVisits}</Text></View>
                    </View>

                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10}}><Text
                            style={styles.baseText}>Month:</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.monthVisitors}</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.monthVisits}</Text></View>
                    </View>

                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10}}><Text
                            style={styles.baseText}>Year:</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.yearVisitors}</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.yearVisits}</Text></View>
                    </View>

                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10}}><Text
                            style={styles.baseText}>Total:</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.totalVisitors}</Text></View>
                        <View style={{width: '37.5%'}}><Text
                            style={styles.data_table}>{this.state.stats.totalVisits}</Text></View>
                    </View>
                </View>

                <View
                    style={{
                        flex: 1,
                        borderBottomColor: '#EFF0F1',
                        borderBottomWidth: 1,
                        marginTop: 10,
                        marginBottom: 10
                    }}
                />

                <PureChart data={chartData} type='line'/>
            </Content>
        );

        var search_engines = (
            <Content style={{flex: 1, width: '90%', alignSelf: 'center'}}>
                <View style={{alignSelf: "center"}}>
                    <Text style={styles.heading_1}>534</Text>
                    <Text style={[styles.baseText, styles.textCenter]}>Total</Text>
                </View>

                <View style={{flex: 1, paddingTop: 20, alignSelf: 'center'}}>
                    <View style={{flex: 1, flexDirection: 'row', paddingBottom: 5}}>
                        <View style={{width: '25%'}}></View>
                        <View style={{width: '37.5%', alignItems: 'center'}}><Text
                            style={styles.baseText}>Today</Text></View>
                        <View style={{width: '37.5%', alignItems: 'center'}}><Text
                            style={styles.baseText}>Yesterday</Text></View>
                    </View>

                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10, flexDirection: 'row'}}>
                            <Image style={{width: 16, height: 16, marginRight: 5}}
                                   source={require('./src/images/baidu.png')}/>
                            <Text style={styles.baseText}>Baidu:</Text>
                        </View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>4324</Text></View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>54543</Text></View>
                    </View>

                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10, flexDirection: 'row'}}>
                            <Image style={{width: 16, height: 16, marginRight: 5}}
                                   source={require('./src/images/bing.png')}/>
                            <Text style={styles.baseText}>Bing:</Text>
                        </View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>4324</Text></View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>54543</Text></View>
                    </View>


                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10, flexDirection: 'row'}}>
                            <Image style={{width: 16, height: 16, marginRight: 5}}
                                   source={require('./src/images/duckduckgo.png')}/>
                            <Text style={[styles.baseText]}>DuckDuckGo:</Text>
                        </View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>4324</Text></View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>54543</Text></View>
                    </View>


                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10, flexDirection: 'row'}}>
                            <Image style={{width: 16, height: 16, marginRight: 5}}
                                   source={require('./src/images/google.png')}/>
                            <Text style={styles.baseText}>Google:</Text>
                        </View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>4324</Text></View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>54543</Text></View>
                    </View>


                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10, flexDirection: 'row'}}>
                            <Image style={{width: 16, height: 16, marginRight: 5}}
                                   source={require('./src/images/yahoo.png')}/>
                            <Text style={styles.baseText}>Yahoo:</Text>
                        </View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>4324</Text></View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>54543</Text></View>
                    </View>

                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{width: '25%', alignSelf: 'center', paddingBottom: 10, flexDirection: 'row'}}>
                            <Image style={{width: 16, height: 16, marginRight: 5}}
                                   source={require('./src/images/yandex.png')}/>
                            <Text style={styles.baseText}>Yandex:</Text>
                        </View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>43244343</Text></View>
                        <View style={{width: '37.5%'}}><Text style={styles.data_table}>1,545,544,343</Text></View>
                    </View>
                </View>

                <View
                    style={{
                        flex: 1,
                        borderBottomColor: '#EFF0F1',
                        borderBottomWidth: 1,
                        marginTop: 10,
                        marginBottom: 10
                    }}
                />

                <PureChart data={chartData} type='line'/>
            </Content>
        );

        switch (this.state.selectedTab) {
            case 'visitors':
                return visitors;
                break;

            case 'summary':
                return summary;
                break;

            case 'search_engines':
                return search_engines;
                break;

            default:
                return summary;
                break;
        }
    }

    render() {
        return (
            <Container style={{paddingTop: 10, backgroundColor: '#ffffff'}}>
                <Content>
                    {this.renderSelectedTab()}
                </Content>

                <Footer>
                    <FooterTab>
                        <Button full active={this.state.selectedTab === 'visitors'}
                                onPress={() => this.setState({selectedTab: 'visitors'})}>
                            <Icon name="ios-people"/>
                            <Text style={{fontSize: 10}}>Visitors</Text>
                        </Button>

                        <Button full active={this.state.selectedTab === 'summary'}
                                onPress={() => this.setState({selectedTab: 'summary'})}>
                            <Icon name="ios-podium"/>
                            <Text style={{fontSize: 10}}>Summary</Text>
                        </Button>

                        <Button full active={this.state.selectedTab === 'search_engines'}
                                onPress={() => this.setState({selectedTab: 'search_engines'})}>
                            <Icon name="ios-search"/>
                            <Text style={{fontSize: 10}}>Search Engines</Text>
                        </Button>
                    </FooterTab>
                </Footer>
            </Container>
        );
    }
}

const RootStack = StackNavigator(
    {
        Home: {
            screen: HomeScreen,
        },
        AddWebsite: {
            screen: AddNewWebsiteScreen,
        },
        ShowStats: {
            screen: ShowStatsScreen,
        }
    },
    {
        initialRouteName: 'Home',
    }
);

export default class App extends React.Component {
    render() {
        return <RootStack/>;
    }
}
