import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import ZUIQuery from 'zui/ZUIQuery';
import {
  Autocomplete,
  FormControl,
  ListSubheader,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { ChangeEventHandler, useState } from 'react';
import { FormattedMessage, FormattedMessage as Msg, useIntl } from 'react-intl';

import getSurveysWithElements from 'features/smartSearch/fetching/getSurveysWithElements';
import { COLUMN_TYPE, SelectedViewColumn } from '../types';
import {
  ELEMENT_TYPE,
  RESPONSE_TYPE,
  ZetkinSurveyElement,
} from 'utils/types/zetkin';

interface SurveyResponseConfigProps {
  onOutputConfigured: (columns: SelectedViewColumn[]) => void;
}

export enum SURVEY_QUESTION_OPTIONS {
  ALL_OPTIONS = 'AllSingle',
  ALL_OPTIONS_SEPARATED = 'AllOptionsSeparated',
  ONE_OPTION = 'oneOption',
}

const SurveyResponseConfig = ({
  onOutputConfigured,
}: SurveyResponseConfigProps) => {
  const { orgId } = useRouter().query;
  const surveysQuery = useQuery(
    ['surveysWithElements', orgId],
    getSurveysWithElements(orgId as string)
  );
  const intl = useIntl();

  const [surveyId, setSurveyId] = useState<number | null>();
  const [selectedQuestion, setSelectedQuestion] =
    useState<ZetkinSurveyElement | null>(null);

  const onSurveyChange: ChangeEventHandler<{ value: unknown }> = (ev) => {
    setSurveyId(ev.target.value as number);
    setSelectedQuestion(null);
    onOutputConfigured([]);
  };

  const makeTextColumn = (selectedElement: ZetkinSurveyElement) => {
    return [
      {
        config: {
          question_id: selectedElement.id,
        },
        title: selectedElement.question.question,
        type: COLUMN_TYPE.SURVEY_RESPONSE,
      },
    ];
  };

  const makeOptionColumns = (
    selectedOption: string | SURVEY_QUESTION_OPTIONS
  ) => {
    if (selectedQuestion !== undefined && selectedQuestion !== null) {
      if (selectedOption === SURVEY_QUESTION_OPTIONS.ALL_OPTIONS) {
        return [
          {
            config: {
              question_id: selectedQuestion.id,
            },

            title: selectedQuestion.question.question,
            type: COLUMN_TYPE.SURVEY_OPTIONS,
          },
        ];
      } else if (
        selectedOption === SURVEY_QUESTION_OPTIONS.ALL_OPTIONS_SEPARATED
      ) {
        return selectedQuestion.question.options?.map((option) => {
          return {
            config: {
              option_id: option.id,
              survey_id: selectedQuestion.id,
            },
            title: option.text,
            type: COLUMN_TYPE.SURVEY_OPTION,
          };
        });
      } else {
        const optionSelected = selectedQuestion.question.options?.find(
          (option) => option.id === parseInt(selectedOption)
        );
        if (optionSelected === undefined) {
          return [];
        }
        return [
          {
            config: {
              option_id: optionSelected.id,
              survey_id: selectedQuestion.id,
            },
            title: optionSelected.text,
            type: COLUMN_TYPE.SURVEY_OPTION,
          },
        ];
      }
    }
  };

  return (
    <ZUIQuery queries={{ surveysQuery }}>
      {({ queries: { surveysQuery: successSurveysQuery } }) => {
        const selectedSurvey = successSurveysQuery.data.find(
          (survey) => survey.id == surveyId
        );
        const questionsFromSurvey = selectedSurvey?.elements
          .filter((elem) => elem.type == ELEMENT_TYPE.QUESTION)
          .filter(
            (elem) =>
              elem.question.response_type === RESPONSE_TYPE.TEXT ||
              elem.question.options?.length
          );

        return (
          <FormControl sx={{ width: 300 }}>
            <TextField
              fullWidth
              label={intl.formatMessage({
                id: 'misc.views.columnDialog.choices.surveyResponse.surveyField',
              })}
              margin="normal"
              onChange={onSurveyChange}
              select
              value={surveyId || ''}
              variant="standard"
            >
              {successSurveysQuery.data.map((survey) => (
                <MenuItem key={survey.id} value={survey.id}>
                  {survey.title}
                </MenuItem>
              ))}
            </TextField>
            {!!surveyId && (
              <Autocomplete
                disabled={!surveyId}
                fullWidth
                getOptionLabel={(option) => option.question.question}
                onChange={(evt, value) => {
                  if (value !== null) {
                    setSelectedQuestion(value);
                    if (value.question.response_type === RESPONSE_TYPE.TEXT) {
                      const columns = makeTextColumn(value);
                      onOutputConfigured(columns);
                    }
                  }
                }}
                options={questionsFromSurvey || []}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputProps={{
                      ...params.inputProps,
                    }}
                    label={intl.formatMessage({
                      id: 'misc.views.columnDialog.choices.surveyResponse.questionField',
                    })}
                    variant="standard"
                  ></TextField>
                )}
                value={selectedQuestion}
              />
            )}
            {selectedQuestion?.question.response_type ===
              RESPONSE_TYPE.TEXT && (
              <Typography sx={{ marginTop: '15' }} variant="h6">
                <Msg id="misc.views.columnDialog.choices.surveyResponse.textField" />
              </Typography>
            )}
            {selectedQuestion?.question.response_type ===
              RESPONSE_TYPE.OPTIONS && (
              <TextField
                label={intl.formatMessage({
                  id: 'misc.views.columnDialog.choices.surveyResponse.optionsLabel',
                })}
                onChange={(evt) => {
                  const columns = makeOptionColumns(evt.target.value);
                  if (columns !== undefined) {
                    onOutputConfigured(columns);
                  }
                }}
                select
                variant="standard"
              >
                <ListSubheader>
                  <FormattedMessage id="misc.views.columnDialog.choices.surveyResponse.allOptionsHeader" />
                </ListSubheader>
                <MenuItem value={SURVEY_QUESTION_OPTIONS.ALL_OPTIONS}>
                  <FormattedMessage id="misc.views.columnDialog.choices.surveyResponse.allOptions" />
                </MenuItem>
                <MenuItem value={SURVEY_QUESTION_OPTIONS.ALL_OPTIONS_SEPARATED}>
                  <FormattedMessage id="misc.views.columnDialog.choices.surveyResponse.allOptionsSeparated" />
                </MenuItem>
                <ListSubheader>
                  <FormattedMessage id="misc.views.columnDialog.choices.surveyResponse.oneOption" />
                </ListSubheader>
                {selectedQuestion?.question.options?.map((option) => (
                  <MenuItem key={option.id} value={option.id.toString()}>
                    {option.text}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </FormControl>
        );
      }}
    </ZUIQuery>
  );
};

export default SurveyResponseConfig;
