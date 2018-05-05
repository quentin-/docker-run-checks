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
  logsContainer: {
    color: "#fff",
    marginTop: "12px",
    backgroundColor: "#000"
  },
  logs: {
    margin: 0,
    padding: "12px"
  },
  cardTitle: {
    fontSize: "16px"
  },
  cardSuccess: {
    borderLeft: "5px solid #42c88a",
    marginBottom: "20px"
  },
  cardFailed: {
    borderLeft: "5px solid #c84141",
    marginBottom: "20px"
  },
  cardContent: {
    padding: "12px",
    border: "1px #e3e3e3",
    borderStyle: "solid solid solid none"
  },
  header: {
    fontWeight: 600,
    color: "#555",
    display: "flex",
    alignItems: "center"
  },
  expand: {
    cursor: "pointer"
  }
};

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
        style={
          this.props.runStatus === 0 ? styles.cardSuccess : styles.cardFailed
        }
      >
        <div style={styles.cardContent}>
          <div style={styles.header}>
            <span
              style={styles.expand}
              onClick={() => this.setState({ expanded: !this.state.expanded })}
            >
              ➕
            </span>{" "}
            {this.props.name} {this.props.cmd.join(" ")}
          </div>

          {this.props.runLogs &&
            this.props.runLogs.length > 0 &&
            this.state.expanded && (
              <div style={styles.logsContainer}>
                <pre style={styles.logs}>{this.props.runLogs.join("\n")}</pre>
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

    if (job) {
      const { checks } = job;

      return (
        <div style={styles.root}>
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
