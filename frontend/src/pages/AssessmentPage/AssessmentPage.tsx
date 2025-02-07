import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Assessment, AssessmentQuestion, ObjectAny } from "../../scripts/types";
import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { closeDialog, setDialog } from "../../features/Dialog/DialogSlice";
import { Eye, EyeOff, Pencil } from "lucide-react";
import MinimalisticInput from "../../components/MinimalisticInput/MinimalisticInput";
import { setAlert } from "../../features/Alert/AlertSlice";
import {
  ClientSocketUser,
  MyClientSocket,
} from "../../features/ClientSocket/ClientSocket";
import { isAssessment } from "../../scripts/validation";
import { sleep } from "../../scripts/tools";

const FirstTimeRecommendedQuestionCount = 3;
export default function AssessmentPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params, _] = useSearchParams();
  const [assessmentObj, setAssessmentObj] = useState<Assessment>({});
  const [assessment, setAssessment] = useState<AssessmentQuestion[]>([]);
  const [assessmentUser, setAssessmentUser] = useState<ClientSocketUser>({});
  const [submitting, setSubmitting] = useState(false);

  const { availableAssessmentQuestions, user, ready } = useSelector(
    (store: ReduxRootState) => store.ClientSocket
  );

  const type = params.get("type");
  const assessmentID = params.get("id");
  const firstTime = params.get("firstTime");


  useEffect(() => {
    async function GetAssessment() {
      if (!assessmentID || !ready) {
        return;
      }
      await sleep(500); // sleep because something weird happens otherwise.
      
      MyClientSocket?.GetAssessment(assessmentID, (v: boolean | object) => {
        console.log('get assessment res', v);
        if (typeof v == "boolean") {
          dispatch(
            setAlert({
              title: "Assessment Error",
              body: "This assessment is invalid, or does not exist.",
            })
          );
          return;
        }

        if (!isAssessment(v)) {
          // if a assessment is not published and the user does not own the assessment
          // then the { published: false } will be returned
          const vAny: ObjectAny = v;
          if (typeof vAny.published == "boolean" && !vAny.published) {
            console.log('not published');
            setAssessmentObj({ published: false });
            return;
          }
          return;
        }
        setAssessmentObj(v);
        const { questions, date, published, userID } = v;

        // needed to make tsc happy.
        if (!questions || !date || typeof published != "boolean" || !userID) {
          return;
        }
        setAssessment(questions);
        GetAssessmentOwner(userID);
      });
    }

    function GetAssessmentOwner(userID: string) {
      if (!userID) {
        return;
      }
      MyClientSocket?.GetUser(userID, (v: boolean | object) => {
        if (typeof v == "boolean") {
          dispatch(
            setAlert({
              title: "Assessment User Error",
              body: "We could not get the assessment's user information.",
            })
          );
          return;
        }
        setAssessmentUser(v);
      });
    }
    GetAssessment();
  }, [assessmentID, params, ready]);

  if (!user) {
    return <p>Waiting...</p>;
  }

  if (type == 'new' && assessmentID) {
    return <p>Url does not make sense.</p>
  }

  function addAssessmentQuestion(aQ: AssessmentQuestion) {
    const newAssessment = [...assessment, aQ];
    setAssessment(newAssessment);
  }

  function isAssessmentValid() {
    for (let qIndex in assessment) {
      const q = assessment[qIndex];
      const { warning, question, answer } = q;
      if (warning) {
        dispatch(
          setAlert({
            title: "Invalid Assessment",
            body: `Warning for question ${
              Number(qIndex) + 1
            }: ${warning}. ("${question}"="${answer || ""}")`,
          })
        );
        return false;
      }
    }
    return true;
  }

  function HandleClickSaveAssessment() {
    if (submitting) {
      return;
    } else if ((!userOwnsAssessment && type != 'new')) {
      return;
    }

    if (!isAssessmentValid()) {
      return;
    }

    if (assessment.length < 1) {
      dispatch(
        setAlert({
          title: "More info pls",
          body: "We recommend having at least one question on a self-assessment.",
        })
      );
      return;
    } else if (
      firstTime == "true" &&
      assessment.length < FirstTimeRecommendedQuestionCount
    ) {
      dispatch(
        setAlert({
          title: "Get the best start!",
          body: "Since this is your first assessment, we recommend having at least 3 questions.",
        })
      );
      return;
    }

    if (type == "new") {
      dispatch(
        setDialog({
          title: "Create Assessment?",
          subtitle:
            "Make sure you're answers look good. This will create a new assessment (which you can edit or delete later).",
          buttons: [
            {
              text: "On second thought...",
              onClick: () => {
                dispatch(closeDialog());
              },
            },
            {
              text: "Create Assessment",
              style: {
                backgroundColor: "orange",
                color: "white",
              },
              onClick: () => {
                SaveAssessment();
                dispatch(closeDialog());
              },
            },
          ],
        })
      );
    } else {
      SaveAssessment();
    }
  }

  function SaveAssessment() {
    if (submitting) {
      return;
    } else if ((!userOwnsAssessment && type != 'new')) {
      return;
    }

    setSubmitting(true);
    console.log("submitting", assessment);
    if (type == "new") {
      MyClientSocket?.submitAssessment(
        { questions: assessment, action: "create" },
        (v: boolean | string) => {
          console.log("submitAss res", v);
          setSubmitting(false);
          if (typeof v == "boolean") {
            return;
          }
          setTimeout(() => {
            navigate(`/app/assessment?id=${v}`);
            setTimeout(() => {
              dispatch(
                setAlert({ title: "Success", body: "Assessment Created." })
              );
            }, 500);
          }, 300);
        }
      );
    } else {
      MyClientSocket?.submitAssessment(
        { questions: assessment, action: 'edit', id: assessmentObj.id },
        (v: boolean) => {
          setSubmitting(false);
          if (!v) {
            return;
          }
          MyClientSocket?.requestUpdateSelf();
          setTimeout(() => {
            dispatch(
              setAlert({ title: "Success", body: "Assessment Saved." })
            );
          }, 500);
        }
      );
    }
  }

  function handleAddQuestion() {
    const questionList: string[] = [];

    availableAssessmentQuestions?.forEach((aQ) => {
      for (let existingQuestion of assessment) {
        if (existingQuestion.question == aQ.question) {
          return;
        }
      }
      if (aQ.question) {
        questionList.push(aQ.question);
      }
    });
    const btns = [];
    if (questionList.length > 0) {
      btns.push({
        text: "Select",
        onClick: (params: ObjectAny) => {
          (() => {
            const { question } = params;
            let qIndex = -1;
            if (availableAssessmentQuestions) {
              for (let i = 0; i < availableAssessmentQuestions.length; i++) {
                if (availableAssessmentQuestions[i].question == question) {
                  qIndex = i;
                  break;
                }
              }

              if (qIndex == -1) {
                return;
              }
              addAssessmentQuestion({
                ...availableAssessmentQuestions[qIndex],
                warning: ShortAnswerWarning,
              });
            }
          })();
          dispatch(closeDialog());
        },
        style: { marginLeft: 10 },
      });
    }

    dispatch(
      setDialog({
        title: "Add Question",
        subtitle: "Add a question provided by us, or create your own",
        inputs: [
          {
            label: "Question",
            name: "question",
            type: "select",
            selectOptions:
              questionList.length > 0
                ? questionList
                : ["No questions available"],
            initialValue: questionList[0]
              ? questionList[0]
              : "No questions available",
            disabled: !questionList[0] ? true : false,
          },
        ],
        buttons: [
          {
            text: "Add Custom",
            style: {
              backgroundColor: "orange",
              color: "white",
            },
            onClick: () => {
              addAssessmentQuestion({
                question: "New Question",
                inputType: "text",
                warning: ShortAnswerWarning,
              });
              dispatch(closeDialog());
            },
          },
          ...btns,
        ],
        buttonContainerStyle: {
          justifyContent: questionList.length > 0 ? "space-between" : "end",
          width: questionList.length > 0 ? "100%" : "auto",
        },
      })
    );
  }

  let isCreatePage = false;
  if (type == "new") {
    isCreatePage = true;
  }

  const { userID: assessmentUserID, date, published } = assessmentObj;
  const { id } = user;
  const { username: assessmentUsername } = assessmentUser;
  const userOwnsAssessment = assessmentUserID == id;
  return (
    <div
      style={{
        width: "100vw",
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "start",
        alignItems: "start",
        padding: 30,
        backgroundColor: "#111",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          color: "white",
          borderBottom: "1px solid #fff8",
          margin: 10,
          marginLeft: 0,
          cursor: "pointer",
        }}
        onClick={() => navigate("/app/home")}
      >
        {"<"} Home
      </span>
      <p style={{ color: "white", fontSize: "1.5rem", margin: 0 }}>
        {isCreatePage
          ? "Create Assessment"
          : `${assessmentUsername}'${
              assessmentUsername?.charAt(assessmentUsername.length - 1) != "s"
                ? "s"
                : ""
            } Assessment`}
      </p>
      {!isCreatePage && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{ display: "flex", alignItems: "center", marginLeft: 10 }}
          >
            <p
              style={{
                color: "white",
                fontSize: "1rem",
                margin: 0,
                lineHeight: "0.5em",
                marginBottom: 7,
              }}
            >
              Created:{" "}
              {date ? new Date(date).toLocaleDateString() : "Unknown Date"}
            </p>
          </div>
          <div
            style={{
              height: "1rem",
              marginLeft: "0.5rem",
              marginRight: "0.5rem",
              borderLeft: "1px solid #fff8",
              marginBottom: 7,
            }}
          />
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: 5 }}>
              {published ? <Eye /> : <EyeOff />}
            </div>
            <p
              style={{
                color: "white",
                fontSize: "1rem",
                margin: 0,
                lineHeight: "0.5rem",
                marginBottom: 7,
              }}
            >
              {published ? "Published" : "Not published"}
            </p>
          </div>
        </div>
      )}
      <AssessmentSection
        assessment={assessment}
        setAssessment={setAssessment}
        disabled={(!userOwnsAssessment && type != 'new')||submitting}
      />
      <button
        style={{
          border: "2px solid #fff",
          backgroundColor: "transparent",
          color: "white",
          borderRadius: 30,
          fontSize: "0.8rem",
          marginLeft: 10,
          marginTop: 5,
        }}
        onClick={handleAddQuestion}
      >
        Add Question +
      </button>
      <div
        style={{
          maxWidth: "80vw",
          width: 100,
          height: 0,
          borderTop: "1px solid #fff4",
          marginTop: 10,
          marginBottom: 10,
          marginLeft: 10,
        }}
      />
      <button
        style={{
          border: "2px solid #fff",
          backgroundColor: "transparent",
          color: "white",
          borderRadius: 30,
          fontSize: "1rem",
          opacity: (submitting || (!userOwnsAssessment && type != 'new')) ? 0.5 : 1,
        }}
        disabled={submitting || (!userOwnsAssessment && type != 'new')}
        onClick={HandleClickSaveAssessment}
      >
        {type == "new"
          ? (submitting)
            ? "Creating Assessment..."
            : "Create Assessment"
          : (submitting)
          ? "Saving Assessment..."
          : "Save Assessment"}
      </button>
    </div>
  );
}

const ShortAnswerWarning = "Answer is too short";
const ShortQuestionWarning = "Question is too short.";
function AssessmentSection({
  assessment,
  setAssessment,
  disabled
}: {
  assessment: AssessmentQuestion[];
  setAssessment: (a: AssessmentQuestion[]) => void;
  disabled?: boolean
}) {
  function updateAssessmentQuestion(
    index: number,
    question: string,
    answer: string
  ) {
    let warning = undefined;
    if (question.length < 3) {
      warning = ShortQuestionWarning;
    } else if (answer.length < 3) {
      warning = ShortAnswerWarning;
    }

    const newAssessment = [...assessment];
    newAssessment[index] = {
      ...newAssessment[index],
      question,
      answer,
      warning,
    };
    setAssessment(newAssessment);
  }

  return (
    <div>
      {assessment.map((q, index) => {
        const { question, answer: answerRaw, warning } = q;
        const answer = answerRaw || "";
        if (typeof answer != "string") {
          return null;
        }
        return (
          <div
            key={`q_${index}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <MinimalisticInput
                style={{ marginLeft: 10 }}
                value={question}
                onChange={(val: string) => {
                  updateAssessmentQuestion(index, val, answer);
                }}
                disabled={disabled}
              />
              {!disabled && <Pencil size={"1rem"} style={{ marginLeft: 10 }} />}
            </div>
            {warning && (
              <span style={{ margin: 0, color: "orange", marginLeft: 10 }}>
                {warning}
              </span>
            )}
            <textarea
              placeholder="Your answer"
              style={{
                margin: 0,
                fontSize: "1rem",
                padding: 10,
                borderRadius: 15,
                minWidth: "10rem",
                minHeight: "1.2rem",
                maxWidth: "80%",
                maxHeight: "40vh",
                marginTop: 5,
                height: "4rem",
                width: "28rem",
              }}
              value={answer}
              onChange={(e) =>
                !disabled && updateAssessmentQuestion(index, question || "", e.target.value)
              }
              disabled={disabled}
            />
          </div>
        );
      })}
    </div>
  );
}
