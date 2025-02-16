import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnyFunction, GoalObj, TaskObj } from "../../scripts/types";
import MinimalisticInput from "../../components/MinimalisticInput/MinimalisticInput";
import { Check, Pencil, Trash, X } from "lucide-react";
import {
  ClientSocketUser,
  MyClientSocket,
} from "../../features/ClientSocket/ClientSocket";
import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { setAlert } from "../../features/Alert/AlertSlice";
import MinimalisticButton from "../../components/MinimalisticButton/MinimalisticButton";
import { SaveButtonFixed } from "../../components/SaveButtonFixed/SaveButtonFixed";
import { closeDialog, setDialog } from "../../features/Dialog/DialogSlice";
import Calendar from "react-calendar";
import { unixToDateString } from "../../scripts/tools";
import MinimalisticTextArea from "../../components/MinimalisticTextArea/MinimalisticTextArea";

export default function GoalPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);
  const [params, _] = useSearchParams();
  const [goal, setGoal] = useState<GoalObj | boolean | undefined>(undefined);
  const [goalOwner, setGoalOwner] = useState<ClientSocketUser | boolean>();
  const id = params.get("id");
  const newParam = params.get("new");
  const isNew = newParam == "true";
  const origin = params.get("origin");
  const { user: self, ready } = useSelector(
    (store: ReduxRootState) => store.ClientSocket
  );

  const pageIsInvalid = (!id && !isNew) || (id && isNew);
  // fetches goal if id is present, and owner
  useEffect(() => {
    if (pageIsInvalid || !MyClientSocket) {
      // this doesn't make sense.
      return;
    }

    if (isNew) {
      setGoalOwner(self);
      setGoal({
        name: "New Goal",
        tasks: [],
      });
      return;
    } else if (id) {
      // fetch for goal, then fetch for owner of goal.
      MyClientSocket.GetGoal(id, (v: boolean | GoalObj) => {
        setGoal(v);
        if (typeof v == "boolean") {
          return;
        }
        const { userID } = v;
        if (!userID) {
          dispatch(
            setAlert({
              title: "Goal retrieval error",
              body: "Goal is malformed",
            })
          );
          return;
        }
        MyClientSocket!.GetUser(userID, (v: boolean | ClientSocketUser) => {
          setGoalOwner(v);
        });
      });
    } else {
      // doesn't make sense.
    }
  }, [id, ready]);

  if (!self || !MyClientSocket) {
    return <p>Waiting for your data...</p>;
  }

  if (pageIsInvalid) {
    return <p>URL doesn't make sense.</p>;
  }

  if (typeof goal == "boolean") {
    return <p>Goal does not exist</p>;
  }

  if (!goal) {
    return <p>Goal is loading...</p>;
  }

  if (typeof goalOwner == "boolean") {
    return <p>Goal owner does not exist</p>;
  } else if (!goalOwner) {
    return <p>Getting goal owner information...</p>;
  }

  const selfIsOwner = self.id == goalOwner.id;

  const setTasks = (tasks: TaskObj[]) => {
    setGoal({ ...goal, tasks });
    setChanged(true);
  };

  const setGoalName = (name: string) => {
    setGoal({ ...goal, name });
    setChanged(true);
  };

  const handleOnSaveClick = () => {
    if (!MyClientSocket || !selfIsOwner) {
      return;
    }
    dispatch(
      setDialog({
        title: `${isNew ? "Create" : "Save"} Goal`,
        subtitle: isNew
          ? "This will create a goal. You sure you want to do this?"
          : "This will save your current goal information. All previous data will be overritted and cannot be undone",
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
              dispatch(closeDialog());
              if (!MyClientSocket) {
                cb && cb();
                return;
              }
              setSaving(true);
              const action = isNew ? "create" : "edit";
              MyClientSocket.SubmitGoal(
                { action, id: id || undefined, goal },
                (v: boolean | string) => {
                  cb && cb();
                  setSaving(false);
                  if (typeof v == "boolean") {
                    if (v) {
                      dispatch(
                        setAlert({
                          title: "Success",
                          body: `Successfully saved goal`,
                        })
                      );
                      setChanged(false);
                    }
                    return;
                  }
                  navigate(`/app/goal?id=${v}`);
                  dispatch(
                    setAlert({
                      title: "Success",
                      body: `Successfully created goal`,
                    })
                  );
                  setChanged(false);
                }
              );
            },
          },
        ],
      })
    );
  };

  const { name, tasks } = goal;
  const { fName, mName, lName, id: ownerID } = goalOwner;

  const handleOnBack = () => {
    if (origin == "user") {
      navigate(`/app/goals?id=${ownerID}`);
      return;
    }
    navigate("/app/home");
  };

  let BackButtonText = "< Home";
  if (origin == "user") {
    BackButtonText = `< ${fName} ${lName}${
      lName!.charAt(lName!.length - 1) == "s" ? "'" : "'s"
    } goals`;
  }

  return (
    <div
    className={'pageBase'}
    >
      <SaveButtonFixed
        onSave={handleOnSaveClick}
        disabled={!selfIsOwner || isNew}
        show={changed}
        saving={saving}
      />
      <MinimalisticButton
        style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}
        onClick={handleOnBack}
      >
        {BackButtonText}
      </MinimalisticButton>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <MinimalisticInput
            value={name || "New Goal"}
            style={{ margin: 0, fontSize: "1.5rem", minWidth: "2rem" }}
            disabled={!selfIsOwner}
            onChange={setGoalName}
          />
          {selfIsOwner && (
            <Pencil style={{ marginLeft: 10 }} size={"1.25rem"} />
          )}
        </div>
        <div style={{ marginBottom: 10 }}>
          <p style={{ margin: 0, marginLeft: 10 }}>
            by{" "}
            <span style={{ fontWeight: "bold" }}>
              {fName} {mName} {lName}
            </span>
          </p>
        </div>

        <p style={{ margin: 0, fontSize: "1.25rem" }}>Tasks</p>
        <div style={{ marginLeft: 10 }}>
          <TasksSection
            disabled={!selfIsOwner}
            tasks={tasks}
            setTasks={setTasks}
          />
        </div>
      </div>
      {(!selfIsOwner || isNew) && (
        <MinimalisticButton
          onClick={handleOnSaveClick}
          style={{ marginTop: 10 }}
        >
          Create Assessment
        </MinimalisticButton>
      )}
    </div>
  );
}

function TasksSection({
  tasks,
  setTasks,
  disabled,
}: {
  tasks?: TaskObj[];
  setTasks: Function;
  disabled: boolean;
}) {
  function handleAddTask() {
    const newTasks = [...(tasks || [])];
    const newTask: TaskObj = {
      name: "New Task",
      description: "Task description",
    };
    newTasks.push(newTask);
    setTasks(newTasks);
  }

  function handleEditTask(tIndex: number, newTask: TaskObj) {
    if (!tasks) {
      return;
    }
    const newTasks = [...tasks];
    newTasks[tIndex] = newTask;
    setTasks(newTasks);
  }

  function handleDeleteTask(tIndex: number) {
    if (!tasks) {
      return;
    }
    const newTasks = [...tasks];
    newTasks.splice(tIndex, 1);
    setTasks(newTasks);
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "start" }}
    >
      {tasks?.map((task, tIndex) => {
        return (
          <div key={`task_${tIndex}`} style={{ margin: 5 }}>
            <Task
              task={task}
              setTask={(task: TaskObj) => handleEditTask(tIndex, task)}
              onDelete={() => handleDeleteTask(tIndex)}
              disabled={disabled}
            />
          </div>
        );
      })}
      {(!tasks || tasks.length == 0) && (
        <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>No tasks</span>
      )}
      {!disabled && (
        <MinimalisticButton style={{ marginTop: 10 }} onClick={handleAddTask}>
          Add Task +
        </MinimalisticButton>
      )}
    </div>
  );
}

function Task({
  task,
  setTask,
  onDelete,
  disabled,
}: {
  task: TaskObj;
  setTask: (v: TaskObj) => any;
  onDelete: AnyFunction;
  disabled: boolean;
}) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const { name, description, completitionDate } = task;

  function handleChangeName(newName: string) {
    setTask({ name: newName, description, completitionDate });
  }

  function handleChangeDescription(newDesc: string) {
    setTask({ name, description: newDesc, completitionDate });
  }

  function handleChangeCompletionDate(newDate: number | undefined) {
    if (newDate) {
      setTask({ name, description, completitionDate: newDate });
    } else {
      setTask({ name, description });
    }
  }

  function handleDaySelect(v?: Date) {
    handleChangeCompletionDate(v?.getTime());
    setOpenCalendar(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: 'end' }}>
        <MinimalisticInput
          disabled={disabled}
          onChange={handleChangeName}
          value={name || "New Task"}
          style={{ minWidth: '3rem', fontWeight: 'bold', fontSize: '1.25rem' }}
        />
        <div style={{display: 'flex', marginLeft: '0.5rem' }}>
          <span onClick={() => setOpenCalendar(true)} style={{ borderBottom: '1px #fff4 solid', cursor: 'pointer' }}>{ completitionDate ? unixToDateString(completitionDate) : 'Not Complete' }</span>
          {completitionDate && <Check style={{marginLeft: '0.1rem'}} color={'#0a0'}/>}
        </div>
        {!disabled && (
          <Trash
            onClick={onDelete}
            size={"1.25rem"}
            style={{ marginLeft: "0.5rem", cursor: "pointer", marginBottom: '0.2rem' }}
          />
        )}
      </div>
      <div style={{ marginLeft: 10 }}>
        <MinimalisticTextArea
          disabled={disabled}
          onChange={handleChangeDescription}
          value={description}
          placeholder="Task Description"
        />
      </div>
      {openCalendar && <SelectDayOverlay onClickDay={handleDaySelect} onCancel={() => setOpenCalendar(false)} />}
    </div>
  );
}

function SelectDayOverlay({ onClickDay, onCancel }: { onClickDay?: (d?: Date) => any, onCancel?: AnyFunction }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: 30,
        boxSizing: "border-box",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0004",
        position: "fixed",
        inset: 0,
        backdropFilter: "blur(2px)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          boxSizing: "border-box",
          maxWidth: "90vw",
          padding: "1.25rem",
          backgroundColor: "#444",
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "end",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
            width: "100%",
          }}
        >
          <span style={{ fontSize: "1.5rem", textAlign: "start" }}>
            Completition Date
          </span>
          <X size={"2rem"} style={{cursor: 'pointer'}} onClick={onCancel} />
        </div>
        <Calendar calendarType="hebrew" onClickDay={(v) => onClickDay&&onClickDay(v)} />
        <button
        onClick={() => onClickDay && onClickDay(undefined)}
          style={{
            marginTop: 10,
            fontSize: "1.25rem",
            width: "100%",
            backgroundColor: "#777",
            color: "#ddd",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0
          }}
        >
          Not Complete
        </button>
      </div>
    </div>
  );
}
