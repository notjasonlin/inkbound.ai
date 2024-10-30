"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import Alert from "@/components/ui/Alert";

interface EnterUrlProps {
  highlights: any;
  userId: string;
}

const EnterUrl = ({ highlights, userId }: EnterUrlProps) => {
  const [url, setUrl] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const submit = async () => {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-zA-Z0-9\\-]+)\\.)+[a-zA-Z]{2,})' + // domain name and extension
      '(\\/[a-zA-Z0-9@:%._\\+~#?&//=]*)?$', // path and query string
      'i'
    );
    const validity = urlPattern.test(url);
    setIsValid(validity);

    if (validity) {
      if (highlights == null) {
        highlights = [];
      }
      if (!highlights.includes(url)) {
        if (highlights[0] == null) {
          highlights[0] = url;
        } else {
          highlights.push(url);
        }
        const { data, error } = await supabase
          .from("player_profiles")
          .update({ highlights })
          .eq("user_id", userId)
          .select();

        if (error) {
          setAlertMessage("Failed");
        } else {
          setAlertMessage("Added");
        }
      } else {
        setAlertMessage("Failed");
      }
    } else {
      setAlertMessage("Invalid URL");
    }
    setIsOpen(true);
  };

  const ShowAlert = () => {
    if (alertMessage === "Added") {
      return (
        <Alert
          message={"Successfully added highlight tape!"}
          type={"success"}
          onClose={() => setIsOpen(false)}
        />
      );
    } else if (alertMessage === "Failed") {
      return (
        <Alert
          message={"Highlight tape already added."}
          type={"error"}
          onClose={() => setIsOpen(false)}
        />
      );
    } else if (alertMessage === "Invalid URL") {
      return (
        <Alert
          message={"Invalid URL format, please check and try again."}
          type={"warning"}
          onClose={() => setIsOpen(false)}
        />
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      {isOpen && <ShowAlert />}
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={url}
          onChange={handleChange}
          placeholder="Enter a URL"
          style={{
            ...styles.input,
            borderColor: isValid ? "#ccc" : "red",
          }}
        />
        <button onClick={submit} style={styles.button}>
          Submit
        </button>
      </div>

      {!isValid && <p style={styles.errorMessage}>Please enter a valid URL</p>}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
    padding: "20px",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "row" as "row",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    width: "300px",
    borderRadius: "5px",
    borderWidth: "2px",
    borderColor: "#ccc",
    outline: "none",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  errorMessage: {
    color: "red",
    fontSize: "14px",
  },
};

export default EnterUrl;
