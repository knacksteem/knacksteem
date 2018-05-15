import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import moment from 'moment';
import { Tabs, Icon } from 'antd';
import * as R from 'ramda';
import * as Actions from '../actions/constants';
import Feed from './Feed';
import EmptyFeed from '../statics/EmptyFeed';
import ScrollToTop from '../components/Utils/ScrollToTop';
import { getIsAuthenticated, getAuthenticatedUser } from '../reducers';
// @UTOPIAN
import { getContributions, getModerations } from '../actions/contributions';
import { getModerators } from '../actions/moderators';
import CategoryIcon from '../components/CategoriesIcons';
import './SubFeed.less';

const TabPane = Tabs.TabPane;

@connect(
  state => ({
    authenticated: getIsAuthenticated(state),
    user: getAuthenticatedUser(state),
    contributions: state.contributions,
    loading: state.loading,
    moderators: state.moderators,
  }),
  {
    getContributions,
    getModerations,
    getModerators,
  },
)
class SubFeed extends React.Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    user: PropTypes.shape().isRequired,
    match: PropTypes.shape().isRequired,
    moderators: PropTypes.array,
    isOwner: PropTypes.bool,
    project: PropTypes.shape() || null,
  };

  state = {
    skip: 0,
  };

  constructor(props) {
    super(props);
    this.loadContributions = this.loadContributions.bind(this);
    this.total = 0;
  }

  isModerator() {
    const { moderators, user } = this.props;
    return R.find(R.propEq('account', user.name))(moderators);
  }
  componentWillMount() {
    const { moderators, getModerators, match, history } = this.props;

    if (!moderators || !moderators.length) {
      getModerators();
    }

    if (match.params.status && !this.isModerator() && match.path.split('/')[2] !== 'moderations') {
      history.push('/all/review');
    }
  }

  componentDidMount() {
    this.loadContributions();
  }

  loadContributions(nextProps = false) {
    const { match, getContributions, getModerations, getContributionsAccepted, getContributionsPending, getContributionsRequest, user, contributions } = nextProps || this.props;
    const skip = nextProps ? 0 : this.state.skip;
    // console.log('[c] m',match);
    const limit = 20;
    this.total = nextProps ? 0 : this.total;
	this.setState({
		skip: skip
	});
    if (match.params.repoId) {
      getContributions({
        limit,
        skip,
        section: 'project',
        sortBy: 'created',
        platform: match.params.platform,
        projectId: match.params.repoId,
        type: match.params.type || 'all',
      }).then((res) => {
        this.total = res.response.total;
        this.setState({ skip: skip + limit });
      });
    } else if (match.path === '/@:name' || match.path.split('/')[2] === 'contributions') {
      if (match.params.status === '') {
        match.params.status = 'all';
      }
      const statusArray = ['flagged', 'reviewed', 'pending', 'any'];

      getContributions({
        limit,
        skip,
        section: 'author',
        sortBy: 'created',
        author: match.params.name,
        status: statusArray.indexOf(match.params.status) >= 0 ? match.params.status : 'all',
        reset: (skip == 0),
      }).then((res) => {
        this.total = res.response.total;
        this.setState({ skip: skip + limit });
      });
    } else if (match.path.split('/')[2] === 'moderations') {
      if (match.params.status === '') {
        match.params.status = 'any';
      }
      getModerations({
        limit,
        skip,
        post_status: match.params.status,
        start_date: (this.state.startDate) ? moment(this.state.startDate).format('YYYY-MM-DD') : new Date(0).toISOString(),
        end_date: (this.state.endDate) ? moment(this.state.endDate).format('YYYY-MM-DD') : new Date().toISOString(),
        moderator: match.params.name,
        reset: !((skip > 0 && !(this.state.startDate || this.state.endDate))),
      }).then((res) => {
        this.total = res.response.total;
        this.setState({
          skip: skip + limit,
        });
      });
    } else if (match.params.filterBy === 'review') {
      getContributions({
        limit,
        skip,
        section: 'all',
        sortBy: 'created',
        filterBy: 'review',
        status: this.isModerator() && match.params.status === 'pending' ? 'pending' : 'any',
        moderator: user.name || 'any',
        type: match.params.type || 'all',
		reset: (skip == 0),
      }).then((res) => {
        this.total = res.response.total;
        this.setState({ skip: skip + limit });
      });
    } else {
      getContributions({
        limit,
        skip,
        section: 'all',
        sortBy: 'created',
        filterBy: match.params.filterBy || 'any',
        type: match.params.type || 'all',
		reset: (skip == 0),
      }).then((res) => {
        this.total = res.response.total;
        this.setState({ skip: skip + limit });
      });
    }
  }

  renderContributions() {
    const { contributions, match, user } = this.props;

	if(!this.state.skip)
	{
		return [];
	}

    const filteredContributions = contributions.filter((contribution) => {
      if (match.params.repoId && contribution.json_metadata.repository) {
        if (match.params.type === 'all') {
          // console.log("PATH /all ");
          return contribution.json_metadata.repository.id === parseInt(match.params.repoId) &&
            contribution.reviewed === true && !contribution.flagged;
        } else if (match.params.type === 'tasks') {
          // console.log("PATH1 /tasks ");
          return contribution.json_metadata.repository.id === parseInt(match.params.repoId) &&
            contribution.reviewed === true && !contribution.flagged &&
            contribution.json_metadata.type.indexOf('task') > -1;
        }
        return contribution.json_metadata.repository.id === parseInt(match.params.repoId) &&
            contribution.reviewed === true &&
            !contribution.flagged &&
            contribution.json_metadata.type === match.params.type;
      } else if (match.path === '/@:name') {
        // console.log("PATH /@:name ", contribution.author, match.params.name, contribution.reviewed, contribution.pending, contribution.flagged);
        return contribution.author === match.params.name &&
          !contribution.flagged;
      } else if (match.path.split('/')[2] === 'moderations' || 'contributions') {
        return true;
      } else if ((match.params.type && match.params.type === 'tasks') || (match.path === '/tasks') || (match.filterBy === 'review' && contribution.reviewed === false && contribution.flagged === false)) {
        // console.log("PATH2 /tasks ",contribution.json_metadata.type, contribution.reviewed);
        return (contribution.json_metadata.type.indexOf('task') > -1) &&
          !contribution.flagged &&
          contribution.reviewed === true;
      } else if (match.params.filterBy && match.params.filterBy === 'review') {
        // console.log("PATH /review");
        if (match.params.status && match.params.status === 'pending' && this.isModerator()) {
          return contribution.reviewed === false &&
            contribution.pending === true &&
            !contribution.flagged &&
            contribution.moderator === user.name;
        }
        if (match.params.type !== 'all') {
          return contribution.reviewed === false &&
            !contribution.flagged &&
            contribution.json_metadata.type === match.params.type;
        }
        return contribution.reviewed === false &&
          (contribution.moderator !== user.name) && // contributions pending review of logged moderator already in pending review section
          !contribution.flagged;
      } else if (match.params.type && match.params.type !== 'all') {
        return contribution.json_metadata.type === match.params.type &&
          !contribution.flagged &&
          contribution.reviewed === true;
      }
      return contribution.reviewed === true && !contribution.flagged;
    });
    // console.log("[c] f", filteredContributions);

    return filteredContributions;
  }

  isTask() {
    if (this.props.match.params.type) {
      if (this.props.match.params.type.indexOf('task') > -1) {
        return true;
      }
    }
    return false;
  }

  componentWillReceiveProps(nextProps) {
    const { location } = this.props;
    // console.log("[c] componentwil")
    if (location.pathname !== nextProps.location.pathname) {
      this.total = 0; // @TODO @UTOPIAN antipattern - requires better implementation
      this.loadContributions(nextProps);
    }
  }

  renderDatePicker() {
    return (
      <DateRangePicker
        startDate={this.state.startDate}
        startDateId="start_date_id"
        endDate={this.state.endDate}
        endDateId="end_date_id"
        onDatesChange={({ startDate, endDate }) => {
          this.setState({ startDate, endDate, skip: 0 }, function () {
            this.loadContributions();
          });
        }}
        focusedInput={this.state.focusedInput}
        onFocusChange={focusedInput => this.setState({ focusedInput })}
        showClearDates
        isOutsideRange={() => false}
      />
    );
  }

  render() {
    const { loading, history, match, loaded, location, isModerator, isOwner, project } = this.props;

    const contributions = this.renderContributions();
    const isFetching = loading === Actions.GET_CONTRIBUTIONS_REQUEST;
    const hasMore = this.total > contributions.length;

    const goTo = (type) => {
      const { history, location, match } = this.props;

      if (match.params.filterBy && type === 'pending') {
        return history.push('/all/review/pending');
      }

      if (match.path.split('/')[2] === 'moderations') {
        return history.push(`/@${match.params.name}/moderations/${type}`);
      }

      if (match.path.split('/')[2] === 'contributions' || match.path === '/@:name') {
        return history.push(`/@${match.params.name}/contributions/${type}`);
      }

      if (match.params.filterBy) {
        return history.push(`/${type}/${match.params.filterBy}`);
      }

      if (match.params.repoId) {
        return history.push(`/project/${match.params.author}/${match.params.repo}/${match.params.platform}/${match.params.repoId}/${type}`);
      }

      history.push(`/${type}`);
    };

    return (
      <div>
        <ScrollToTop />
        {(match.path === '/@:name') || (match.path.split('/')[2] === 'contributions') ?
          <Tabs className="filter-tab" activeKey={match.params.status || 'all'} onTabClick={type => goTo(`${type}`)}>
            <TabPane tab={<span><Icon type="appstore-o" />All</span>} key="all" />
            <TabPane tab={<span className="md-subfeed-icons">Reviewed</span>} key="reviewed" />
            <TabPane tab={<span className="md-subfeed-icons">Rejected</span>} key="flagged" />
            <TabPane tab={<span className="md-subfeed-icons">Pending</span>} key="pending" />
          </Tabs> : null}

        {((match.path.split('/')[2] !== 'moderations') &&
          (match.path !== '/@:name' && match.path.split('/')[2] !== 'contributions') ||
          (match.params.type === 'blog' && this.isModerator() && match.params.filterBy === 'review') &&
          ((match.path !== '/tasks' && !this.isTask()) ||
          ((match.path == '/tasks' || (this.isTask())) && this.isModerator() && match.params.filterBy === 'review'))) &&
          !((match.path === '/tasks' || (this.isTask() && match.params.filterBy !== 'review'))) ?
          <Tabs activeKey={match.params.type || 'all'} onTabClick={type => goTo(`${type}`)}>
              {/* this.isModerator() && match.params.filterBy === 'review' ? <TabPane tab={<span><Icon type="safety" />Pending Review</span>} key="pending" /> : null */}
              <TabPane tab={<span><Icon type="appstore-o" />All</span>} key="all" />
              {this.isModerator() && match.params.filterBy === 'review' ? <TabPane tab={<span><Icon type="paper-clip" />Blog Posts</span>} key="blog" /> : null}
              {match.params.repoId && <TabPane tab={<span><Icon type="notification" />Tasks Requests</span>} key="tasks" />}
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="ideas" />Vlog</span>} key="ideas" />
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="sub-projects" />Graphics</span>} key="sub-projects" />
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="development" />Art</span>} key="development" />
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="bug-hunting" />Knack</span>} key="bug-hunting" />
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="translations" />One Altruism</span>} key="translations" />
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="graphics" />Music</span>} key="graphics" />
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="analysis" />Joke/Humor</span>} key="analysis" />
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="social" />Inspiring</span>} key="social" />
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="documentation" />Visibility/Marketing</span>} key="documentation" />
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="tutorials" />Tutorials</span>} key="tutorials" />
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="video-tutorials" />News</span>} key="video-tutorials" />
              <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="copywriting" />Quotes</span>} key="copywriting" />
            </Tabs> : null}

        {(match.path === '/tasks' || (this.isTask() && match.params.filterBy !== 'review')) ?
          <Tabs activeKey={match.params.type || 'all'} onTabClick={type => goTo(`${type}`)}>
            {/* <TabPane tab={<span className="md-subfeed-icons"><Icon type="appstore-o" />All</span>} key="tasks" /> */}
            <TabPane tab={<span className=""><Icon type="notification" />Tasks Requests</span>} key="tasks" />
            <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="task-ideas" />Thinkers</span>} key="task-ideas" />
            <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="task-development" />Developers</span>} key="task-development" />
            <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="task-bug-hunting" />Bug Hunters</span>} key="task-bug-hunting" />
            <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="task-translations" />Translators</span>} key="task-translations" />
            <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="task-graphics" />Designers</span>} key="task-graphics" />
            <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="task-analysis" />Analysts</span>} key="task-analysis" />
            <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="task-social" />Influencers</span>} key="task-social" />
            <TabPane tab={<span className="md-subfeed-icons"><CategoryIcon from="from-subfeed" type="task-documentation" />Tech Writers</span>} key="task-documentation" />

          </Tabs>
          : null }

        {(match.path.split('/')[2] === 'moderations') ?
          <Tabs className="filter-tab" activeKey={match.params.status || ''} onTabClick={type => goTo(`${type}`)}>
            <TabPane tab={<span><Icon type="appstore-o" />All</span>} key="" />
            <TabPane tab={<span className="md-subfeed-icons">Reviewed</span>} key="reviewed" />
            <TabPane tab={<span className="md-subfeed-icons">Rejected</span>} key="flagged" />
            <TabPane tab={<span className="md-subfeed-icons">Pending</span>} key="pending" />
          </Tabs> : null}
        {(match.path.split('/')[2] === 'moderations') ? this.renderDatePicker() : null}
        <Feed
          content={contributions}
          isFetching={isFetching}
          hasMore={hasMore}
          loadMoreContent={this.loadContributions}
          contentType={match.params.type}
          showBlogs={((match.path === '/@:name') || (match.params.type === 'blog') || (match.params.filterBy === 'review'))}
          showTasks={(match.path === '/tasks' || (this.isTask()) || (match.params.filterBy === 'review') || (match.path === '/@:name'))}
        />
        {!contributions.length && !isFetching && <EmptyFeed type={match.params.type} />}
      </div>
    );
  }
}

export default SubFeed;
