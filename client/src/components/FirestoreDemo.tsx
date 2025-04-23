import { useEffect, useState } from "react";
import { addWord, clearUser, getWords } from "../utils/api";
import { useUser } from "@clerk/clerk-react";

export default function FirestoreDemo() {
  const [words, setWords] = useState<string[]>([]);
  const { user } = useUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  const USER_ID = user.id;

  useEffect(() => {
    getWords(USER_ID).then((data) => {
      if (data && data.words) {
        setWords(data.words);
      } else {
        setWords([]);
      }
    });
  }, [USER_ID]);

  const addFavoriteWord = async (newWord: string) => {
    setWords([...words, newWord]);
    await addWord(USER_ID, newWord);
  };

  return (
    <div className="firestore-demo">
      <h2>Firestore Demo</h2>
      <label htmlFor="new-word">Add a favorite word:</label>
      <input aria-label="word-input" id="new-word" type="text" />
      <button
        aria-label="add-word-button"
        onClick={() => {
          const newWord = (
            document.getElementById("new-word") as HTMLInputElement
          ).value;
          addFavoriteWord(newWord);
        }}
      >
        Add
      </button>
      <button
        onClick={async () => {
          setWords([]);
          await clearUser(USER_ID);
        }}
      >
        Clear words
      </button>

      <p>
        <i aria-label="user-header">Favorite words for {user.fullName}:</i>
      </p>
      <ul aria-label="favorite-words">
        {words.map((word, index) => (
          <p key={index} aria-label="word">
            {word}
          </p>
        ))}
      </ul>
    </div>
  );
}
