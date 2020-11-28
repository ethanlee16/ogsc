import Button from "components/Button";
import { useState } from "react";
import Joi from "joi";
import DateComboBox from "components/Player/DateComboBox";

function getYears(): string[] {
  const date: Date = new Date();
  const year: number = date.getFullYear();
  const yearList: string[] = [];
  for (let x = 0; x < 10; x += 1) {
    const newYear = year - x;
    yearList.push(newYear.toString());
  }
  return yearList;
}

export const years = getYears();

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type Props = React.PropsWithChildren<{
  setHidden: React.Dispatch<React.SetStateAction<boolean>>;
  schoolScores: string[];
  setSchoolScores: React.Dispatch<React.SetStateAction<string[]>>;
  advisingScores: string[];
  setAdvisingScores: React.Dispatch<React.SetStateAction<string[]>>;
  athleticScores: string[];
  setAthleticScores: React.Dispatch<React.SetStateAction<string[]>>;
}>;

const AddScoreField: React.FC<Props> = ({
  setHidden,
  schoolScores,
  setSchoolScores,
  advisingScores,
  setAdvisingScores,
  athleticScores,
  setAthleticScores,
}: Props) => {
  const [field, SetField] = useState<string>("");
  const [score, SetScore] = useState<string>("");
  const [selectMonth, SetSelectMonth] = useState<string>("");
  const [selectYear, SetSelectYear] = useState<string>("");
  const [error, setError] = useState("");

  const check = (): void => {
    Joi.assert(
      field,
      Joi.string().required(),
      "You must select a score category "
    );
    Joi.assert(
      score,
      Joi.number().required().min(0).max(10),
      "Score is requried and must be a number 1 - 10 "
    );
    Joi.assert(
      selectMonth,
      Joi.string().required(),
      "You must select a Month "
    );
    Joi.assert(selectYear, Joi.number().required(), "You must select a Year ");
  };

  async function ScoreSubmit(event?: React.BaseSyntheticEvent): Promise<void> {
    event?.preventDefault();
    try {
      check();
      const dateShown = `${selectMonth} ${selectYear}`;
      const value = `${score} - ${dateShown}`;
      if (field === "School") {
        setSchoolScores(() => [...schoolScores, value]);
      } else if (field === "Advising") {
        setAdvisingScores(() => [...advisingScores, value]);
      } else {
        setAthleticScores(() => [...athleticScores, value]);
      }
      setHidden(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <fieldset>
      <div className="border border-border rounded-lg p-10">
        <p className="text-sm font-semibold mb-3">Score Category</p>
        <DateComboBox
          items={["School", "Advising", "Athletic"]}
          placeholder=""
          setState={SetField}
        />
        <p className="text-sm font-semibold mb-3 mt-10">Score</p>
        <input
          type="text"
          className="input text-sm w-1/12 font-light"
          name="score"
          placeholder="1 - 10"
          onChange={(event) => SetScore(event.target.value)}
        />
        <p className="text-sm font-semibold mb-3 mt-10">Month/Year</p>
        <div className="grid grid-cols-5 mb-10">
          <DateComboBox
            items={months}
            placeholder="Month"
            setState={SetSelectMonth}
          />
          <DateComboBox
            items={years}
            placeholder="Year"
            setState={SetSelectYear}
          />
        </div>
        <div className="flex flex-row gap-6">
          <Button
            iconType="plus"
            className="py-2 px-5 text-sm"
            onClick={() => ScoreSubmit()}
          >
            Enter Score
          </Button>
          <Button
            className="border border-blue bg-white py-2 px-12 text-sm border-opacity-100"
            onClick={() => setHidden(false)}
          >
            Cancel
          </Button>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </fieldset>
  );
};
export default AddScoreField;
