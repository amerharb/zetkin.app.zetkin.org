import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

import MappedPreview from './MappedPreview';
import messageIds from 'features/import/l10n/messageIds';
import { Msg } from 'core/i18n';
import useSheets from 'features/import/hooks/useSheets';

const MappingPreview = () => {
  const theme = useTheme();
  const { sheets, selectedSheetIndex, firstRowIsHeaders } = useSheets();
  const currentSheet = sheets[selectedSheetIndex];
  const [personIndex, setPersonIndex] = useState(0);
  const emptyPreview = currentSheet.columns.every(
    (item) => item.selected === false
  );

  useEffect(() => {
    setPersonIndex(0);
  }, [selectedSheetIndex]);

  return (
    <Box p={2} sx={{ bgColor: 'beige' }}>
      <Box alignItems="center" display="flex" sx={{ mb: 1.5 }}>
        <Typography sx={{ mr: 2 }} variant="h5">
          <Msg id={messageIds.configuration.preview.title} />
        </Typography>
        <Button
          disabled={personIndex === 0}
          onClick={() =>
            setPersonIndex((prev) => (personIndex !== 0 ? prev - 1 : prev))
          }
          startIcon={<ArrowBackIos />}
        >
          <Msg id={messageIds.configuration.preview.previous} />
        </Button>
        <Button
          disabled={
            personIndex ===
            currentSheet.rows.length - (firstRowIsHeaders ? 2 : 1)
          }
          endIcon={<ArrowForwardIos />}
          onClick={() =>
            setPersonIndex((prev) =>
              personIndex < currentSheet.rows.length - 1 ? prev + 1 : prev
            )
          }
        >
          <Msg id={messageIds.configuration.preview.next} />
        </Button>
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          border: '1px solid lightgrey',
          borderRadius: '5px',
          display: 'flex',
          height: '80px',
          p: 2,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ minWidth: '150px' }}
          width="100%"
        >
          {emptyPreview &&
            Array(currentSheet.columns.length)
              .fill(2)
              .map((item, index) => {
                return (
                  <Box
                    key={`empty-preview-${index}`}
                    flexGrow={1}
                    sx={{
                      backgroundColor: theme.palette.transparentGrey.light,
                      height: '14px',
                      mr: item,
                    }}
                  />
                );
              })}
          {!emptyPreview &&
            currentSheet.columns.map((column, index) => {
              return (
                column.selected && (
                  <MappedPreview
                    column={column}
                    columnIndex={index}
                    currentSheet={currentSheet}
                    personIndex={personIndex}
                  />
                )
              );
            })}
        </Box>
      </Box>
    </Box>
  );
};

export default MappingPreview;
