import React from "react";
import cx from "classnames";
import PropTypes from "prop-types";
import fetch from "isomorphic-unfetch";

import css from "../styles/check.css";

class ImageCard extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    runStatus: PropTypes.number,
    cmd: PropTypes.arrayOf(PropTypes.string),
    runLogs: PropTypes.arrayOf(PropTypes.string)
  };

  state = {
    expanded: false
  };

  render() {
    return (
      <div
        className={cx(css.card, {
          [css.cardSuccess]: this.props.runStatus === 0,
          [css.cardFailure]: this.props.runStatus !== 0
        })}>
        <div className={css.cardContent}>
          <div
            className={css.header}
            onClick={() => this.setState({ expanded: !this.state.expanded })}>
            <span
              className={cx(css.expandButton, {
                [css.expandButtonExpanded]: this.state.expanded,
                [css.expandButtonCollapsed]: !this.state.expanded
              })}>
              ➡
            </span>{" "}
            {this.props.name} {this.props.cmd.join(" ")}
          </div>

          {this.props.runLogs &&
            this.props.runLogs.length > 0 &&
            this.state.expanded && (
              <div className={css.logContainer}>
                <pre className={css.logs}>{this.props.runLogs.join("\n")}</pre>
              </div>
            )}
        </div>
      </div>
    );
  }
}

class CheckPage extends React.Component {
  static propTypes = {
    job: PropTypes.object,
    error: PropTypes.string
  };

  static async getInitialProps({ req }) {
    const host = req.protocol + "://" + req.header("host");
    const url = host + `/api/v1/checks/${req.params.id}`;

    const data = await fetch(url);
    const json = await data.json();

    if (data.status === 200) {
      return { job: json };
    } else if (data.status === 404) {
      return { error: "error: could not find job" };
    } else {
      return { error: "error: fatal error" };
    }
  }

  render() {
    const { job, error } = this.props;

    if (error) {
      return (
        <div>
          <p>{error.toString()}</p>
        </div>
      );
    }

    if (job) {
      const { checks } = job;

      return (
        <div className={css.root}>
          {checks.map((check, index) => (
            <ImageCard
              key={index}
              cmd={check.cmd}
              name={check.name}
              runLogs={check.execution_logs}
              runStatus={check.execution_status_code}
            />
          ))}
        </div>
      );
    }

    return null;
  }
}

export default CheckPage;
