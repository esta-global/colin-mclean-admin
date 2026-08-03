import React from "react";
import { Helmet } from "react-helmet";

function ReactHelmet(props: PropTypes) {
  return (
    <Helmet>
      <title>{props.title ? `${props.title} - Lamikraft` : "My Title"}</title>
    </Helmet>
  );
}

export default ReactHelmet;

type PropTypes = {
  title: string;
};
