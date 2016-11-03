import React, { Component } from 'react';
import PostSingleContent from './PostSingleContent';
import Icon from './../widgets/Icon';
import './PostSingleModal.scss';

export default class PostSingleModal extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // manipulate address bar to show the article's address
    if (window && window.history) {
      const { content } = this.props;
      const postPath = `/${content.parent_permlink}/@${content.author}/${content.permlink}`;
      window.history.pushState({}, content.title, postPath);
    }
    // freeze scroll in the feed
    if (window) {
      window.document.querySelector('body').style.overflow = 'hidden';
    }
  }

  handleClose = (e) => {
    this.props.closePostModal();
    // fix the manipulated URL
    if (window && window.history) {
      window.history.back();
    }
    // un-freeze scroll in the feed
    if (window) {
      window.document.querySelector('body').style.overflow = 'initial';
    }
  };

  render() {
    const { content, onClickReblog, sidebarIsVisible } = this.props;

    return (
      <div className={ sidebarIsVisible ? 'PostSingleModal withSidebar' : 'PostSingleModal' }>
        <div className={ sidebarIsVisible ? 'PostBar withSidebar' : 'PostBar' }>
          <a onClick={this.handleClose} className="PostBar__close">
            <Icon name="clear" />
          </a>
        </div>
        <PostSingleContent
          content={content}
        />
      </div>
    );
  }
}
