/* eslint-disable react/display-name */
import { ChangeEventHandler, useEffect, useRef } from 'react';

import Error from '@material-ui/icons/Error';
import Search from '@material-ui/icons/Search';

import { useIntl } from 'react-intl';
import {
  CircularProgress,
  InputAdornment,
  TextField,
  Tooltip,
} from '@material-ui/core';

const SearchFieldIcon: React.FunctionComponent<{
  error: boolean;
  loading: boolean;
}> = ({ loading, error }) => {
  return (
    <InputAdornment position="start">
      {loading ? (
        <CircularProgress size={24} />
      ) : error ? (
        <Tooltip title="Error making the search request">
          <Error color="error" />
        </Tooltip>
      ) : (
        // Default
        <Search />
      )}
    </InputAdornment>
  );
};

interface SearchFieldProps {
  onChange: ChangeEventHandler<HTMLInputElement>;
  loading: boolean;
  error: boolean;
}

const SearchField: React.FunctionComponent<SearchFieldProps> = ({
  onChange,
  loading,
  error,
}) => {
  const intl = useIntl();
  const input = useRef<HTMLInputElement>();

  useEffect(() => {
    // Focus when opening the component
    if (input && input.current) {
      input.current.focus();
    }
  }, [input]);

  return (
    <TextField
      aria-label={intl.formatMessage({
        id: 'layout.organize.search.label',
      })}
      fullWidth
      InputProps={{
        startAdornment: <SearchFieldIcon error={error} loading={loading} />,
      }}
      inputRef={input}
      onChange={onChange}
      placeholder={intl.formatMessage({
        id: 'layout.organize.search.placeholder',
      })}
      variant="outlined"
    />
  );
};

export default SearchField;
