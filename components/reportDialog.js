import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Dialog from "react-native-dialog";
import { createForumReport } from "./forumFunc";

const ReportDialog = (props) => {
  const [reportText, setReportText] = useState("");

  return (
    <View>
      <Dialog.Container visible={props.visible}>
        <Dialog.Title>Report the respective Forum</Dialog.Title>
        <Dialog.Description>
          Please provide your reason for reporting
        </Dialog.Description>
        <Dialog.Input
          placeholder="Report Description"
          value={reportText}
          onChangeText={(text) => setReportText(text)}
        />
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            props.setVisible(false);
            setReportText("");
          }}
        />
        <Dialog.Button
          label="Report"
          onPress={() => {
            createForumReport(props.forumId, reportText);
            props.setVisible(false);
            setReportText("");
          }}
        />
      </Dialog.Container>
    </View>
  );
};

export default ReportDialog;

const styles = StyleSheet.create({});
