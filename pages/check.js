import React from "react";
import PropTypes from "prop-types";
import fetch from "isomorphic-unfetch";
import Avatar from "material-ui/Avatar";
import Card, { CardHeader } from "material-ui/Card";

const styles = {
  root: {
    flexGrow: 1,
    padding: "12px"
  },
  avatar: {
    pending: {
      backgroundColor: "#fff78c"
    },
    failed: {
      backgroundColor: "#ffb2b2"
    },
    success: {
      backgroundColor: "#b2ffbd"
    }
  },
  logs: {
    color: "#fff",
    padding: "12px",
    backgroundColor: "#000"
  },
  cardTitle: {
    fontSize: "20px"
  }
};

class ImageCard extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    runStatus: PropTypes.number,
    cmd: PropTypes.arrayOf(PropTypes.string),
    runLogs: PropTypes.arrayOf(PropTypes.string)
  };

  state = {};

  handleExpandClick = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  render() {
    let avatarStyle;

    switch (this.props.runStatus) {
      case null:
        avatarStyle = styles.avatar.pending;
        break;
      case 0:
        avatarStyle = styles.avatar.success;
        break;
      default:
        avatarStyle = styles.avatar.failed;
        break;
    }

    return (
      <Card style={styles.card}>
        <CardHeader
          title={
            <pre style={styles.cardTitle}>
              docker run {this.props.name} {this.props.cmd.join(" ")}
            </pre>
          }
          avatar={<Avatar aria-label="Recipe" style={avatarStyle} />}
        />
        {this.props.runLogs &&
          this.props.runLogs.length > 0 && (
            <pre style={styles.logs}>{this.props.runLogs.join("\n")}</pre>
          )}
      </Card>
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

    if (job) {
      const { checks } = job;

      return (
        <div style={styles.root}>
          <div style={styles.content}>
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
        </div>
      );
    }

    if (error) {
      return (
        <div>
          <p>{error.toString()}</p>
        </div>
      );
    }

    return null;
  }
}

export default CheckPage;
