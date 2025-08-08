import React from 'react';
import PropTypes from 'prop-types';

const MyButton = ({ label }) => {
  return <button style={{ padding: '8px 16px', fontSize: '16px' }}>{label}</button>;
};

MyButton.propTypes = {
  label: PropTypes.string.isRequired,
};

export default MyButton;
