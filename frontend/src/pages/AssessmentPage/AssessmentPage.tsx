import { SetStateAction, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AssessmentQuestion, ObjectAny } from "../../scripts/types";
import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { closeDialog, setDialog } from "../../features/Dialog/DialogSlice";
import { isAssessmentQuestion } from "../../scripts/validation";
import { Pencil } from "lucide-react";

export default function AssessmentPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const [assessment, setAssessment] = useState<AssessmentQuestion[]>([]);
  const { availableAssessmentQuestions } = useSelector(
    (store: ReduxRootState) => store.ClientSocket
  );

  const type = params.get("type");


  function addAssessmentQuestion(aQ: AssessmentQuestion) {
    console.log("adding", aQ);
    const newAssessment = [...assessment, aQ];
    setAssessment(newAssessment);
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
              addAssessmentQuestion(availableAssessmentQuestions[qIndex]);
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
                inputType: "string",
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

  console.log('ass', assessment);
  return (
    <div
      style={{
        width: "100vw",
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "start",
        alignItems: "start",
        padding: 15,
        backgroundColor: "#111",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <button
        style={{ backgroundColor: "white" }}
        onClick={() => navigate("/app/home")}
      >
        Home
      </button>
      <p style={{ color: "white", fontSize: "1.5rem", margin: 0 }}>
        {isCreatePage ? "Create Assessment" : "Existing Assessment"}
      </p>
      <AssessmentSection
        assessment={assessment}
        setAssessment={setAssessment}
      />
      <button style={{ backgroundColor: "white" }} onClick={handleAddQuestion}>
        Add Question +
      </button>
    </div>
  );
}

function AssessmentSection({
  assessment,
  setAssessment,
}: {
  assessment: AssessmentQuestion[];
  setAssessment: (a: AssessmentQuestion[]) => void;
}) {
  function updateAssessmentQuestion(index: number, question: string, answer: string) {
    const newAssessment = [...assessment];
    newAssessment[index] = {
      ...newAssessment[index], question, answer
    }
    setAssessment(newAssessment);
  }

  return (
    <div>
      {assessment.map((q, index) => {
        const { question, answer } = q
        return (
          <div
            key={`q_${index}`}
            style={{
              marginBottom: "1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <div style={{marginBottom: 10, display: 'flex', alignItems: 'center'}}>
              <span
                suppressContentEditableWarning={true}
                onInput={(e: ObjectAny) => updateAssessmentQuestion(index, e.target['innerText'], answer || '')}
                style={{ fontSize: "1rem", margin: 0, borderBottom: '1px solid #fff4', textWrap: 'wrap' }}
                contentEditable
              >
                {question}
              </span>
              <Pencil size={'1rem'} style={{marginLeft: 10}}/>
            </div>
            <textarea
              placeholder="Your answer"
              style={{
                margin: 0,
                fontSize: "1rem",
                padding: 10,
                borderRadius: 15,
                minWidth: '10rem',
                minHeight: '1.2rem',
                maxWidth: '80%',
                maxHeight: '40vh'
              }}
              value={answer}
              onChange={(e) => updateAssessmentQuestion(index, question || '', e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}
