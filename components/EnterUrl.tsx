"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import Alert from "@/components/ui/Alert";
import styles from '@/styles/EnterUrl.module.css';
import { cn } from '@/lib/utils'; // Assuming you have a className utility

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
      '^(https?:\\/\\/)?' +
      '((([a-zA-Z0-9\\-]+)\\.)+[a-zA-Z]{2,})' +
      '(\\/[a-zA-Z0-9@:%._\\+~#?&//=]*)?$',
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
    <div className={styles.container}>
      {isOpen && <ShowAlert />}
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={url}
          onChange={handleChange}
          placeholder="Enter a URL"
          className={cn(
            styles.input,
            !isValid && styles.inputInvalid
          )}
        />
        <button onClick={submit} className={styles.button}>
          Submit
        </button>
      </div>

      {!isValid && <p className={styles.errorMessage}>Please enter a valid URL</p>}
    </div>
  );
};

export default EnterUrl; 