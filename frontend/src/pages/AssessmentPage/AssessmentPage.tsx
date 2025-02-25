import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Assessment, AssessmentQuestion, ObjectAny } from "../../scripts/types";
import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { closeDialog, setDialog } from "../../features/Dialog/DialogSlice";
import { Trash } from "lucide-react";
import MinimalisticInput from "../../components/MinimalisticInput/MinimalisticInput";
import { setAlert } from "../../features/Alert/AlertSlice";
import {
  ClientSocketUser,
  MyClientSocket,
} from "../../features/ClientSocket/ClientSocket";
import { isAssessment } from "../../scripts/validation";
import MinimalisticButton from "../../components/MinimalisticButton/MinimalisticButton";
import MinimalisticTextArea from "../../components/MinimalisticTextArea/MinimalisticTextArea";
import { SaveButtonFixed } from "../../components/SaveButtonFixed/SaveButtonFixed";
import useTutorialWithDialog from "../../hooks/UseTutorialWithDialog/useTutorialWithDialog";

const FirstTimeRecommendedQuestionCount = 5;
export default function AssessmentPage() {
  const { availableAssessmentQuestions, user, ready } = useSelector(
    (store: ReduxRootState) => store.ClientSocket
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);
  const [params, _] = useSearchParams();
  const [assessmentObj, setAssessmentObj] = useState<Assessment>({});
  const originalAssessment = useRef<AssessmentQuestion[]>([]);
  const [assessment, setAssessment] = useState<AssessmentQuestion[]>([]);
  const [assessmentUser, setAssessmentUser] = useState<ClientSocketUser>({});
  const ShowTutorial = useTutorialWithDialog();

  const type = params.get("type");
  const assessmentID = params.get("id");
  const firstTime = params.get("firstTime");

  const isNew = type == "new";

  function handleOnResetClick() {
    setChanged(false);
    setAssessment(originalAssessment.current);
  }

  // gets the assessment of the current page. Only works if assessmentID is set.
  useEffect(() => {
    async function GetAssessment() {
      if (!assessmentID || !ready) {
        return;
      }

      MyClientSocket?.GetAssessment(assessmentID, (v: boolean | object) => {
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
        originalAssessment.current = questions;
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

  // if creating new assessment (not first time), it will automatically pull the answers of the previous assessment to this one.
  useEffect(() => {
    if (!(isNew && !firstTime) || !MyClientSocket || !user) {
      return;
    }

    if (!user.assessments) {
      // this shouldn't happen.
      navigate("/app/assessment?type=new&firstTime=true", { replace: true });
      return;
    }

    let newestAssessmentID;
    let newestAssessmentDate = 0;
    for (let assessmentID of Object.keys(user.assessments)) {
      const assessmentPreviewObj = user.assessments[assessmentID];
      if (assessmentPreviewObj.date > newestAssessmentDate) {
        newestAssessmentDate = assessmentPreviewObj.date;
        newestAssessmentID = assessmentID;
      }
    }

    // by this point, we should have the ID of the newest assessment
    if (!newestAssessmentID) {
      return;
    }

    MyClientSocket.GetAssessment(newestAssessmentID, (v: Assessment) => {
      if (!v) {
        return;
      }

      const questions = v.questions;
      if (!questions) {
        return;
      }
      setAssessment(questions);
      originalAssessment.current = questions;
      dispatch(
        setAlert({
          title: "We got your latest answers",
          body: "See how you've improved since your latest assessment",
        })
      );
    });
  }, [isNew, firstTime]);

  // if user is viewing one of their older assessments, this will warn them.
  useEffect(() => {
    if (!user || !user.assessments || isNew || !assessmentID) {
      return;
    }
    let currentAssessmentDate: number | undefined;
    let newestAssessmentDate: number = 0;
    let newestAssessmentID: string;
    for (let [currentAssessmentID, assessmentPreviewObj] of Object.entries(
      user.assessments
    )) {
      if (assessmentID == currentAssessmentID) {
        currentAssessmentDate = assessmentPreviewObj.date;
      }

      if (assessmentPreviewObj.date > newestAssessmentDate) {
        newestAssessmentDate = assessmentPreviewObj.date;
        newestAssessmentID = currentAssessmentID;
      }
    }
    if (!currentAssessmentDate) {
      return;
    }

    if (newestAssessmentDate > currentAssessmentDate) {
      dispatch(
        setDialog({
          title: "You have newer self-assessments",
          subtitle: `You're viewing a past assessment. While you can edit it, consider updating your current assessment, or creating a new one to reflect your present progress.`,
          buttons: [
            {
              text: "Continue",
              onClick: () => {
                dispatch(closeDialog());
              },
            },
            {
              text: "View latest assessment",
              style: {
                backgroundColor: "#e50",
                color: "white",
              },
              onClick: () => {
                navigate("/app/assessment?id=" + newestAssessmentID, {
                  replace: true,
                });
                dispatch(closeDialog());
              },
            },
          ],
          buttonContainerStyle: { marginTop: "1rem" },
        })
      );
    }
  }, []);

  if (!user) {
    return <p>Waiting...</p>;
  }

  if (isNew && assessmentID) {
    return <p>Url does not make sense.</p>;
  }

  function addAssessmentQuestion(aQ: AssessmentQuestion) {
    setChanged(true);
    const newAssessment = [...assessment, aQ];
    setAssessment(newAssessment);
  }

  function updateAssessment(a: AssessmentQuestion[]) {
    setChanged(true);
    setAssessment(a);
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
        style: {
          backgroundColor: "orange",
          color: "white",
        },
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

  const handleOnSaveClick = () => {
    if (!MyClientSocket || (!userOwnsAssessment && !isCreatePage)) {
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

    dispatch(
      setDialog({
        title: `${isNew ? "Create" : "Save"} Assessment`,
        subtitle: isNew
          ? "This will create an assessment. You sure you want to do this?"
          : "This will save your current goal information. All previous data will be overritted and cannot be undone.",
        buttonContainerStyle: {
          width: "100%",
          justifyContent: "space-between",
        },
        buttons: [
          {
            text: "On second thought...",
          },
          {
            text: isNew ? "Create" : "Save",
            style: {
              backgroundColor: "#26610E",
              color: "#ddd",
            },
            useDisableTill: true,
            onClick: (_, cb) => {
              if (!MyClientSocket) {
                cb && cb();
                dispatch(closeDialog());
                return;
              }
              const action = isNew ? "create" : "edit";

              if (saving) {
                return;
              } else if (!userOwnsAssessment && type != "new") {
                return;
              }

              setSaving(true);
              const assessmentCopy: AssessmentQuestion[] = [];
              for (let assessmentQ of assessment) {
                const cur = { ...assessmentQ };
                delete cur.warning;
                assessmentCopy.push(cur);
              }

              MyClientSocket.submitAssessment(
                {
                  questions: assessmentCopy,
                  action: action,
                  id: assessmentObj.id,
                },
                (v: boolean | string) => {
                  dispatch(closeDialog());
                  cb && cb();
                  setSaving(false);
                  if (typeof v == "boolean") {
                    if (v) {
                      dispatch(
                        setAlert({
                          title: "Success",
                          body: `Successfully saved assessment`,
                        })
                      );
                      setChanged(false);
                      originalAssessment.current = assessmentCopy;
                    }
                    return;
                  }
                  navigate(`/app/assessment?id=${v}`, { replace: true });
                  dispatch(
                    setAlert({
                      title: "Success",
                      body: `Successfully created assessment`,
                    })
                  );
                  setSaving(false);
                  setChanged(false);
                  originalAssessment.current = assessmentCopy;
                }
              );
            },
          },
        ],
      })
    );
  };

  let isCreatePage = false;
  if (type == "new") {
    isCreatePage = true;
  }

  const { userID: assessmentUserID, date } = assessmentObj;
  const { id } = user;
  const { username: assessmentUsername } = assessmentUser;
  const userOwnsAssessment = assessmentUserID == id;
  return (
    <div className={"pageBase"}>
      <SaveButtonFixed
        onSave={handleOnSaveClick}
        onReset={handleOnResetClick}
        disabled={!userOwnsAssessment || isNew}
        show={changed}
        saving={saving}
      />
      <MinimalisticButton
        style={{
          color: "white",
          marginBottom: 10,
          fontSize: "0.9rem",
          marginLeft: 0,
          cursor: "pointer",
        }}
        onClick={() => navigate(-1)}
      >
        {"<"} Back
      </MinimalisticButton>
      <p style={{ color: "white", fontSize: "1.5rem", margin: 0 }}>
        {isCreatePage
          ? "Create Assessment"
          : `${assessmentUsername}'${
              assessmentUsername?.charAt(assessmentUsername.length - 1) != "s"
                ? "s"
                : ""
            } Assessment`}
      </p>
      {isCreatePage && (
        <span
          style={{
            borderBottom: "1px solid #fff6",
            marginBottom: "1rem",
            cursor: "pointer",
          }}
          onClick={() => ShowTutorial("selfAssessments")}
        >
          How do assessments work?
        </span>
      )}
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
        </div>
      )}
      {assessment.length == 0 && (
        <span style={{ marginBottom: "2rem", backgroundColor: "#c85" }}>
          Press <b>Add Question+</b> and choose one you can answer best!
        </span>
      )}
      <AssessmentSection
        assessment={assessment}
        setAssessment={updateAssessment}
        disabled={(!userOwnsAssessment && type != "new") || saving}
      />
      {!(!userOwnsAssessment && type != "new") && (
        <MinimalisticButton
          style={{
            fontSize: "0.8rem",
            marginLeft: 10,
            marginTop: 5,
          }}
          disabled={!userOwnsAssessment && type != "new"}
          onClick={handleAddQuestion}
        >
          Add Question +
        </MinimalisticButton>
      )}
      <div
        style={{
          maxWidth: "80vw",
          height: "1rem",
          borderTop: "1px solid #fff4",
        }}
      />
      {isNew && (
        <MinimalisticButton onClick={() => handleOnSaveClick()}>
          Create Assessment
        </MinimalisticButton>
      )}
      <div
        style={{
          maxWidth: "80vw",
          height: "10vh",
          borderTop: "1px solid #fff4",
          marginTop: 10,
          marginBottom: 10,
          marginLeft: 10,
        }}
      />
    </div>
  );
}

const ShortAnswerWarning = "Answer is too short";
const ShortQuestionWarning = "Question is too short.";
function AssessmentSection({
  assessment,
  setAssessment,
  disabled,
}: {
  assessment: AssessmentQuestion[];
  setAssessment: (a: AssessmentQuestion[]) => void;
  disabled?: boolean;
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
    if (!warning) {
      delete newAssessment[index].warning;
    }
    setAssessment(newAssessment);
  }

  function deleteAssessmentQuestion(index: number) {
    const newAssessment = [...assessment];
    newAssessment.splice(index, 1);
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
              marginBottom: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <MinimalisticInput
                style={{ marginLeft: "0.5rem" }}
                value={question}
                onChange={(val: string) => {
                  updateAssessmentQuestion(index, val, answer);
                }}
                disabled={disabled}
              />
              {!disabled && (
                <Trash
                  onClick={() => deleteAssessmentQuestion(index)}
                  size={"1.2rem"}
                  style={{ marginLeft: 10, cursor: "pointer" }}
                />
              )}
            </div>
            {warning && (
              <span style={{ margin: 0, color: "orange", marginLeft: 10 }}>
                {warning}
              </span>
            )}
            <MinimalisticTextArea
              placeholder="Your answer"
              value={answer}
              onChange={(e) =>
                !disabled && updateAssessmentQuestion(index, question || "", e)
              }
              disabled={disabled}
            />
          </div>
        );
      })}
    </div>
  );
}
