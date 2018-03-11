import React from "react";
import Link from "next/link";
import fetch from "isomorphic-unfetch";
import Avatar from "material-ui/Avatar";
import AppBar from "material-ui/AppBar";
import Toolbar from "material-ui/Toolbar";
import { withStyles } from "material-ui/styles";
import Typography from "material-ui/Typography";
import IconButton from "material-ui/IconButton";
import Collapse from "material-ui/transitions/Collapse";
import ExpandMoreIcon from "material-ui-icons/ExpandMore";
import Card, { CardHeader, CardContent } from "material-ui/Card";

const styles = {
  root: {
    flexGrow: 1,
    padding: "12px"
  },
  expandOpen: {
    transform: "rotate(180deg)"
  },
  avatar: {
    failed: {
      border: "1px solid #ff8989",
      backgroundColor: "#ffb2b2"
    },
    success: {
      border: "1px solid #89ff9a",
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
  state = {};

  handleExpandClick = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  render() {
    return (
      <Card style={styles.card}>
        <CardHeader
          title={
            <pre style={styles.cardTitle}>
              docker run {this.props.name} {this.props.cmd.join(" ")}
            </pre>
          }
          avatar={
            <Avatar
              aria-label="Recipe"
              style={
                this.props.runStatus === 0
                  ? styles.avatar.success
                  : styles.avatar.failed
              }
            />
          }
        />
        {this.props.runLogs.length > 0 && (
          <pre style={styles.logs}>{this.props.runLogs.join("\n")}</pre>
        )}
      </Card>
    );
  }
}

class CheckPage extends React.Component {
  state = {
    job: null,
    error: null
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
                pullLogs={check.pull_logs}
                runLogs={check.execution_logs}
                runStatus={check.executation_status_code}
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
