import React from "react";

const Response = ({ htmlString, className }) => {
  return <div className={className} dangerouslySetInnerHTML={{ __html: htmlString }} />;
};

export default Response;
 