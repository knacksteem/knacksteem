import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Menu, Popover, Input, Select, Modal, Button } from 'antd';
import Action from '../Button/Action';

import { getGithubRepos, setGithubRepos } from '../../actions/projects';
import sc2 from '../../sc2';

import Icon from 'antd/lib/icon';
import Avatar from '../Avatar';
import PopoverMenu, { PopoverMenuItem } from '../PopoverMenu/PopoverMenu';

import CategoryIcon from '../CategoriesIcons';
import './Topnav.less';

const InputGroup = Input.Group;
const Option = Select.Option;

@connect(
  state => ({
    repos: state.repos,
  }),
  { getGithubRepos, setGithubRepos },
)
class Topnav extends React.Component {

  state = {
    value: '',
    loading: false,
    loaded: false,
  };

  searchSelected(location) {
    if (location.pathname.indexOf('search/projects') > -1) return 'projects';
    if (location.pathname.indexOf('search/ideas') > -1) return 'ideas';
    if (location.pathname.indexOf('search/development') > -1) return 'development';
    if (location.pathname.indexOf('search/bug-hunting') > -1) return 'bug-hunting';
    if (location.pathname.indexOf('search/translations') > -1) return 'translations';
    if (location.pathname.indexOf('search/graphics') > -1) return 'graphics';
    if (location.pathname.indexOf('search/documentation') > -1) return 'documentation';
    if (location.pathname.indexOf('search/analysis') > -1) return 'analysis';
    if (location.pathname.indexOf('search/social') > -1) return 'social';
    if (location.pathname.indexOf('search/blog') > -1) return 'blog';

    const which = location.pathname.substring(1);
    if (which === 'all' || which === '/all') return 'projects';
    if (location.pathname.split('/').length != 1 && this.inValidPaths(which)) {
      return which;
    }
    return false;
  };

  inValidPaths(x) {
    const validPaths = [
      'projects',
      'ideas',
      'sub-projects',
      'development',
      'bug-hunting',
      'translations',
      'graphics',
      'analysis',
      'social',
      'documentation',
      'tutorials',
      'video-tutorials',
      'copywriting',
      'blog',
      ''
    ]
    return validPaths.includes(x);
  }

  handleChangeSearchType(section) {
    const { history } = this.props;
    this.setState({ searchSection: section });

    // Only change path if we are on a 1st level url of one of the valid paths
    if (this.inValidPaths(history.location.pathname.substring(1))
      && history.location.pathname.split('/').length != 1) {
      if (section === 'projects') section = 'all';
      history.push(`/${section}`);
    }
  }


  constructor (props) {
    super(props)
    this.renderItems = this.renderItems.bind(this);
    this.searchSelected = this.searchSelected.bind(this);
    this.handleChangeSearchType = this.handleChangeSearchType.bind(this);
    this.state = {
      searchSection: this.searchSelected(props.location) || 'projects',
    };
  }

  renderItems(items) {
    return items;
  }

  shortLong(shorter, longer) {
    const size = window.innerWidth;
    if (size <= 736) {
      return shorter;
    }
    return longer;
  }

  contributionWord() {
    if (window.innerWidth <= 736) {
      return <span>&nbsp;</span>;
    } else {
      return "Contribution";
    }
  }

  renderSearch () {
    const { history, location } = this.props;


    return (
      <div className="Search SearchSelector">

        <InputGroup className="SearchSelector" compact>
          <Select className="SearchSelector" defaultValue={this.searchSelected(location) || 'projects'} onChange={this.handleChangeSearchType}>
            <Option className="SearchSelector" value="projects"><Icon type="github" style={{color: "white"}} className="SearchSelectorGit iconfont icon-search" /> All</Option>
            <Option value="ideas"><CategoryIcon from="from-topnav"  className="SearchSelector" type="ideas"/> Vlog</Option>
            <Option value="sub-projects"><CategoryIcon from="from-topnav"  className="SearchSelector" type="sub-projects"/>Graphics</Option>
            <Option value="development"><CategoryIcon from="from-topnav"  className="SearchSelector" type="development"/>Art</Option>
            <Option value="bug-hunting"><CategoryIcon from="from-topnav"  className="SearchSelector" type="bug-hunting"/> Knack</Option>
            <Option value="translations"><CategoryIcon from="from-topnav"  className="SearchSelector" type="translations"/> One Altruism</Option>
            <Option value="graphics"><CategoryIcon from="from-topnav"  className="SearchSelector" type="graphics"/> Music</Option>
            <Option value="analysis"><CategoryIcon from="from-topnav"  className="SearchSelector" type="analysis"/> Joke/Humor</Option>
            <Option value="social"><CategoryIcon from="from-topnav"  className="SearchSelector" type="social"/> Inspiring</Option>
            <Option value="documentation"><CategoryIcon from="from-topnav"  className="SearchSelector" type="documentation"/>Visibility</Option>
            <Option value="tutorials"><CategoryIcon from="from-topnav"  className="SearchSelector" type="tutorials"/> News</Option>
            <Option value="video-tutorials"><CategoryIcon from="from-topnav"  className="SearchSelector" type="video-tutorials"/>Quotes</Option>
            <Option value="copywriting"><CategoryIcon from="from-topnav"  className="SearchSelector" type="copywriting"/> Tech Trend</Option>
            <Option value="blog"><CategoryIcon from="from-topnav"  className="SearchSelector" type="blog"/> {this.shortLong("Blogs", "Blog Posts")}</Option>
          </Select>
          <Input
            ref={input => this.searchInput = input}
            placeholder="Search..."
            onKeyPress={(event) => {
              const q = event.target.value;
              const searchSection = this.state.searchSection;

              if (event.key === 'Enter') {
                history.push(`/search/${searchSection}/${q}`);
              }
            }}
            className="searchBar"
          />
        </InputGroup>

      </div>
    )}
// Login Modal

  state = {
    loading: false,
    visible: false,
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
    setTimeout(() => {
      const { visible, loading } = this.state;
      if(visible){
        window.location.href=sc2.getLoginUrl(window !== undefined && window.location.pathname.length > 1 ? window.location.pathname : '');
        this.setState({ loading: false, visible: false });}
    }, 6000);
  }

  handleOk = () => {
    this.setState({ loading: true });
    window.location.href=sc2.getLoginUrl(window !== undefined && window.location.pathname.length > 1 ? window.location.pathname : '');
  }

  handleCancel = () => {
    this.setState({ visible: false });
  }

  render() {
    const { visible, loading } = this.state;
    const {
      intl,
      username,
      onNotificationClick,
      onSeeAllClick,
      onMenuItemClick,
      notifications,
      repos,
      getGithubRepos,
      setGithubRepos,
      history,
    } = this.props;

    let content;

    const notificationsCount =
      notifications && notifications.filter(notification => !notification.read).length;

    const next = window !== undefined && window.location.pathname.length > 1 ? window.location.pathname : '';

    if (username) {
      content = (
        <div className="Topnav__menu-container">
          <Menu selectedKeys={[]} className="Topnav__menu-container__menu" mode="horizontal">
            <Menu.Item key="write" className="Topnav__item-write-new nobottom">
              <Link to="/write" className="Topnav__newReport" style={{ marginRight: '15px' }}>
                <Action primary={true} cozy={true}
                        text={
                          <span style={{textDecoration: "none"}}><i className="iconfont icon-add"/> <span className="Topnav__newReport_texts">{this.contributionWord()}</span></span>
                        } />
              </Link>
            </Menu.Item>
            <Menu.Item key="user" className="Topnav__item-user">
              <Link className="Topnav__user" to={`/@${username}`}>
                <Avatar username={username} size={36}/>
                {/*<span className="Topnav__user__username">
                 {username}
                 </span>*/}
              </Link>
            </Menu.Item>
            {/*<Menu.Item
             key="notifications"
             className="Topnav__item--badge"
             >
             <Tooltip placement="bottom"
             title={intl.formatMessage({id: 'notifications', defaultMessage: 'Notifications'})}>
             <Popover
             placement="bottomRight"
             trigger="click"
             content={
             <Notifications
             notifications={notifications}
             onClick={onNotificationClick}
             onSeeAllClick={onSeeAllClick}
             />
             }
             title={intl.formatMessage({id: 'notifications', defaultMessage: 'Notifications'})}
             >
             <a className="Topnav__link Topnav__link--light">
             <Badge count={notificationsCount}>
             <i className="iconfont icon-remind"/>
             </Badge>
             </a>
             </Popover>
             </Tooltip>
             </Menu.Item>*/}
            <Menu.Item className="UWhite" key="more">
              <Popover
                className="TopPopover"
                placement="bottom"
                trigger="click"
                content={
                  <PopoverMenu onSelect={onMenuItemClick} className="TopPopover TopRightPopover">
                    <PopoverMenuItem key="new-contribution">
                      New Contribution
                    </PopoverMenuItem>
                    {/*<PopoverMenuItem key="new-blog-post">
                     New Blog Post
                     </PopoverMenuItem>*/}
                    <PopoverMenuItem key="activity">
                      Activity
                    </PopoverMenuItem>
                    <PopoverMenuItem key="review">
                      Review
                    </PopoverMenuItem>
                    <PopoverMenuItem key="drafts">
                      Drafts
                    </PopoverMenuItem>
                    <PopoverMenuItem key="settings">
                      Settings
                    </PopoverMenuItem>
                    <PopoverMenuItem key="logout">
                      Logout
                    </PopoverMenuItem>
                  </PopoverMenu>
                }
              >
                <a className="Topnav__whitelink Topnav__whitelink--light">
                  <i className="iconfont icon-switch"/>
                </a>
              </Popover>
            </Menu.Item>
          </Menu>
        </div>
      );
    } else {
      content = (
        <div className="Topnav__menu-container">
          <Menu className="Topnav__menu-container__menu" mode="horizontal">
            <Menu.Item key="signup" className="UWhite">
              <a target="_blank" rel="noopener noreferrer" className="UWhite" href="https://steemit.com/pick_account">
                <FormattedMessage id="signup" className="UWhite" defaultMessage="Sign up"/>
              </a>
            </Menu.Item>
            <Menu.Item key="divider" className="UWhite" disabled>
              |
            </Menu.Item>
            <Menu.Item className="UWhite" key="login">
              <span onClick={this.showModal} className="UWhite">
                <FormattedMessage id="login" className="UWhite" defaultMessage="Log in"/>
              </span>
            </Menu.Item>
          </Menu>
          <Modal
            visible={visible}
            title="Logging in..."
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={[
              <Button key="back" onClick={this.handleCancel}>Cancel</Button>,
              <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
                Proceed
              </Button>,
            ]}
          >
            You are now being redirected to SteemConnect to authorise your STEEM session.
            <br/>
            For your safety double check that the url starts with https://v2.steemconnect.com/
            <br/>
            <small>Utopian.io will never access your private keys.</small>
          </Modal>
        </div>
      );
    }

    const logoSource = () => {
      var prefix = "https://raw.githubusercontent.com/knacksteem/knacksteem/master";
      if (process.env.NODE_ENV === 'production') prefix = "";
      if (window.innerWidth > 736) {
        return `${prefix}/Logo/Asset 13-24.png`;
      } else {
        return `${prefix}/Logo/Asset 13-24.png`;
      }
    }

    return (
      <div>
        <div className="Topnav">
          <div className="topnav-layout container">
            <div className="left">
              <Link className="Topnav__brand" to="/">
                <img id="MainLogo" src={logoSource()}/>
              </Link>
              <span className="Topnav__version"><Link to="/" className="Topnav__version">{window.innerWidth > 736 && <span>&nbsp;&nbsp;</span>}beta</Link></span>
            </div>
            <div className="center">
              <div className="Topnav__input-container nomobile">
                { this.renderSearch() }
              </div>
            </div>
            <div className="right">
              {content}
            </div>
          </div>
        </div>
        <div className="Searchmobile yesmobile">
          { this.renderSearch() }
        </div>
      </div>
    );
  }
}

Topnav.propTypes = {
  intl: PropTypes.shape().isRequired,
  username: PropTypes.string,
  onNotificationClick: PropTypes.func,
  onSeeAllClick: PropTypes.func,
  onMenuItemClick: PropTypes.func,
  notifications: PropTypes.arrayOf(PropTypes.shape()),
  history: PropTypes.shape().isRequired,
};

Topnav.defaultProps = {
  username: undefined,
  onNotificationClick: () => {},
  onSeeAllClick: () => {},
  onMenuItemClick: () => {},
  notifications: [],
};

export default injectIntl(Topnav);
