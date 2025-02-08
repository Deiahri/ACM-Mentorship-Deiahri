import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { useNavigate, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  ClientSocketUser,
  MyClientSocket,
} from "../../features/ClientSocket/ClientSocket";
import {
  AnyFunction,
  Months,
  ObjectAny,
  SocialTypes,
} from "../../scripts/types";
import { Instagram, Pen, Pencil, Twitter, XIcon, Youtube } from "lucide-react";
import {
  closeDialog,
  DialogInput,
  setDialog,
} from "../../features/Dialog/DialogSlice";
import { FaDiscord, FaLinkedin } from "react-icons/fa";
import { getMonthName, getMonthNumber, sleep } from "../../scripts/tools";
import MinimalisticInput from "../../components/MinimalisticInput/MinimalisticInput";
import MinimalisticButton from "../../components/MinimalisticButton/MinimalisticButton";
import { setAlert } from "../../features/Alert/AlertSlice";
import { useChangeUsernameWithDialog } from "../../hooks/UseChangeUsername";

export default function UserPage() {
  const [params, _] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");
  const [user, setUser] = useState<ClientSocketUser | undefined>(undefined);
  const { ready } = useSelector((store: ReduxRootState) => store.ClientSocket);

  const changeUsernameWithDialog = useChangeUsernameWithDialog();

  function HandleChangeUsername() {
    changeUsernameWithDialog((v?: boolean, newUsername?: string) => {
      if (!v || !newUsername) {
        return;
      }
      setUser({
        ...user,
        username: newUsername
      })
    });
  }

  useEffect(() => {
    async function GetUser() {
      if (!id || !ready) {
        return;
      }
      await sleep(500);
      MyClientSocket?.GetUser(id, (d: unknown) => {
        if (!d || typeof d != "object") {
          return;
        }
        setUser(d);
      });
    }
    GetUser();
  }, [id, ready]);

  function setSocials(newSocials: ObjectAny[]) {
    setUser({
      ...user,
      socials: newSocials,
    });
  }

  function setBio(bio: string) {
    if (bio.length > 200) {
      bio = bio.substring(0, 200);
    }
    setUser({
      ...user,
      bio: bio,
    });
  }

  function setEducation(newEducation: ObjectAny[]) {
    setUser({
      ...user,
      education: newEducation,
    });
  }

  function setCertifications(newCertifications: ObjectAny[]) {
    setUser({
      ...user,
      certifications: newCertifications,
    });
  }

  function setExperience(newExperience: ObjectAny[]) {
    setUser({
      ...user,
      experience: newExperience,
    });
  }

  function setProjects(newProjects: ObjectAny[]) {
    setUser({
      ...user,
      projects: newProjects,
    });
  }

  function setSoftSkills(newSoftSkills: string[]) {
    setUser({
      ...user,
      softSkills: newSoftSkills,
    });
  }

  if (!id) {
    return <p>Uh oh, no id</p>;
  }

  if (!user) {
    return <p>Loading...</p>;
  }

  const {
    username,
    fName,
    mName,
    lName,
    socials,
    experience,
    education,
    certifications,
    projects,
    softSkills,
    isMentor,
    isMentee,
    acceptingMentees,
    assessments,
    DisplayPictureURL,
    bio,
  } = user;

  console.log(user);
  return (
    <div
      style={{
        width: "100vw",
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "start",
        alignItems: "start",
        backgroundColor: "#111",
        flexDirection: "column",
        padding: '2rem',
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
        }}
      >
        <MinimalisticButton
          style={{
            fontSize: "0.8rem",
          }}
          onClick={() => navigate("/app/home")}
        >
          {"<"} Home
        </MinimalisticButton>
        <div style={{ marginTop: 20 }} />
        <p
          style={{
            color: "white",
            fontSize: "1.5rem",
            margin: 0,
            marginBottom: -5,
          }}
        >
          {fName} {mName} {lName}
        </p>
        <div onClick={HandleChangeUsername} style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
          <p
            style={{
              color: "white",
              fontSize: "1rem",
              margin: 0,
              marginLeft: 10,
              opacity: 0.5,
            }}
          >
            aka {username}
          </p>
          <Pencil style={{marginLeft: '0.5rem'}} size={'1rem'}/>
        </div>
        <MentorSection
          isMentor={isMentor}
          acceptingMentees={acceptingMentees}
        />
        <BioSection bio={bio} setBio={setBio} />
        <SocialSection socials={socials} setSocials={setSocials} />
        <EducationSection education={education} setEducation={setEducation} />
        <CertificationSection
          certifications={certifications}
          setCertifications={setCertifications}
        />
        <ExperienceSection
          experience={experience}
          setExperience={setExperience}
        />
        <ProjectSection projects={projects} setProjects={setProjects} />
        <SoftSkillSection
          softSkills={softSkills}
          setSoftSkills={setSoftSkills}
        />
      </div>
      <div style={{height: '10vh'}} />
    </div>
  );
}

function SoftSkillSection({
  softSkills,
  setSoftSkills,
}: {
  softSkills?: string[];
  setSoftSkills: AnyFunction;
}) {
  const [inputSS, setInputSS] = useState("");
  const dispatch = useDispatch();
  function handleAddSoftSkill() {
    let softSkill = inputSS;
    softSkill = softSkill.trim();
    if (softSkill.length < 3) {
      dispatch(
        setAlert({
          title: "Invalid soft skill",
          body: "Soft skill is too short",
        })
      );
      return;
    }
    const newSoftSkills = [...(softSkills || [])];
    newSoftSkills.push(softSkill);
    setSoftSkills(newSoftSkills);
    setInputSS("");
  }

  function handleRemoveSoftSkill(sIndex: number) {
    if (!softSkills || softSkills.length == 0) {
      return;
    }
    const newSoftSkills = [...softSkills];
    newSoftSkills.splice(sIndex, 1);
    setSoftSkills(newSoftSkills);
  }

  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
        Soft Skills
      </p>
      <div style={{ marginLeft: 10, display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
        {(softSkills && softSkills.length > 0) && <div style={{ display: "flex", padding: 5, border: '1px solid #fff4', borderRadius: 15, marginBottom: 10, flexWrap: 'wrap', maxWidth: '80vw' }}>
          {softSkills?.map((softSkill, sIndex) => {
            return (
              <SoftSkill
                onClose={() => handleRemoveSoftSkill(sIndex)}
                key={`sS_${sIndex}`}
                style={{ margin: 5 }}
              >
                {softSkill}
              </SoftSkill>
            );
          })}
        </div>}
        {(!softSkills || softSkills.length == 0) && (
          <p style={{ margin: 0, opacity: 0.5 }}>No soft skills</p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddSoftSkill();
          }}
          style={{marginTop: 5, display: 'flex'}}
        >
          <input
            style={{
              backgroundColor: "transparent",
              fontSize: "1rem",
              border: "1px solid #fffd",
              padding: 5,
              paddingLeft: 10,
              width: '10rem',
              borderRadius: 10,
              color: "white",
            }}
            placeholder="Add soft skill"
            value={inputSS}
            onChange={(e) => setInputSS(e.target.value)}
          />
          <MinimalisticButton style={{marginLeft: '0.5rem', fontSize: '0.8rem'}}>Add Soft Skill +</MinimalisticButton>
        </form>
      </div>
    </>
  );
}

function ExperienceSection({
  experience,
  setExperience,
}: {
  experience?: ObjectAny[];
  setExperience?: AnyFunction;
}) {
  function handleExperienceChange(index: number, dat: ObjectAny) {
    if (!setExperience || !experience) {
      return;
    }
    const { title: company, subtitle: position, description, range } = dat;
    const newExp = [...experience];
    newExp[index] = { company, position, description, range };
    setExperience(newExp);
  }

  function addExperience() {
    if (!setExperience) {
      return;
    }
    const newExp = [...(experience || [])];
    newExp.push({
      company: "Company name",
      position: "position",
      description: "Here's a description of your experience",
      range: { start: [1, 2000], end: [1, 2004] },
    });
    setExperience(newExp);
  }

  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
        Experience
      </p>
      <div style={{ marginLeft: 10 }}>
        {experience?.map((experience, eIndex) => {
          const { company, position, description, range } = experience;
          return (
            <ExperienceLikeSection
              key={`exp_${eIndex}`}
              title={company}
              subtitle={position}
              description={description}
              range={range}
              onChange={(dat: ObjectAny) => handleExperienceChange(eIndex, dat)}
            />
          );
        })}
        {(!experience || experience.length == 0) && (
          <p style={{ margin: 0, opacity: 0.5 }}>No experience</p>
        )}
      </div>
      <MinimalisticButton
        style={{ fontSize: "0.8rem", marginLeft: 10, marginTop: 5 }}
        onClick={addExperience}
      >
        Add Experience +
      </MinimalisticButton>
    </>
  );
}

function ProjectSection({
  projects,
  setProjects,
}: {
  projects?: ObjectAny[];
  setProjects?: AnyFunction;
}) {
  function handleProjectChange(index: number, dat: ObjectAny) {
    if (!setProjects || !projects) {
      return;
    }
    const { title: name, subtitle: position, description, range } = dat;
    const newExp = [...projects];
    newExp[index] = { name, position, description, range };
    setProjects(newExp);
  }

  function addProject() {
    if (!setProjects) {
      return;
    }
    const newExp = [...(projects || [])];
    newExp.push({
      name: "Project name",
      position: "position",
      description: "Here's a description of your project",
      range: { start: [1, 2000], end: [1, 2004] },
    });
    setProjects(newExp);
  }
  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>Projects</p>
      <div style={{ marginLeft: 10 }}>
        {projects?.map((project, pIndex) => {
          const { name, position, description, range } = project;
          return (
            <ExperienceLikeSection
              key={`project_${pIndex}`}
              title={name}
              subtitle={position}
              description={description}
              range={range}
              onChange={(dat: ObjectAny) => handleProjectChange(pIndex, dat)}
            />
          );
        })}
        {(!projects || projects.length == 0) && (
          <p style={{ margin: 0, opacity: 0.5 }}>No projects</p>
        )}
      </div>
      <MinimalisticButton
        style={{ fontSize: "0.8rem", marginLeft: 10, marginTop: 5 }}
        onClick={addProject}
      >
        Add Project +
      </MinimalisticButton>
    </>
  );
}

function CertificationSection({
  certifications,
  setCertifications,
}: {
  certifications?: ObjectAny[];
  setCertifications?: AnyFunction;
}) {
  function handleCertificationChange(newCertificationData: ObjectAny) {
    console.log("cert", newCertificationData);
  }

  function handleAddCertification() {
    const newCerts = [...(certifications || [])];
    newCerts.push({
      name: "New Certification",
      issuingOrg: "Issuing Organization",
    });
    setCertifications && setCertifications(newCerts);
  }

  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
        Certifications
      </p>
      <div style={{ marginLeft: 10 }}>
        {certifications?.map((cert, cIndex) => {
          const { name, issuingOrg } = cert;
          return (
            <ExperienceLikeSection
              key={`cert_${cIndex}`}
              title={name}
              subtitle={issuingOrg}
              onChange={handleCertificationChange}
            />
          );
        })}
        {(!certifications || certifications.length == 0) && (
          <p style={{ margin: 0, opacity: 0.5 }}>No certifications</p>
        )}
      </div>
      <MinimalisticButton
        style={{ fontSize: "0.8rem", marginLeft: 10, marginTop: 5 }}
        onClick={handleAddCertification}
      >
        Add Certification +
      </MinimalisticButton>
    </>
  );
}

function MentorSection({
  isMentor,
  acceptingMentees,
}: {
  isMentor?: boolean;
  acceptingMentees?: boolean;
}) {
  return (
    <>
      <div
        style={{
          backgroundColor: "#555",
          display: "flex",
          justifyContent: "start",
          width: "auto",
        }}
      >
        {isMentor ? (
          acceptingMentees ? (
            <MenteeRequestSection />
          ) : (
            <span style={{ margin: 0 }}>Not accepting mentees</span>
          )
        ) : (
          <span style={{ margin: 0 }}>Not a mentor</span>
        )}
      </div>
    </>
  );
}

function EducationSection({
  education,
  setEducation,
}: {
  education?: ObjectAny[];
  setEducation: AnyFunction;
}) {
  function handleEducationOnChange(index: number, newEduObjRaw: ObjectAny) {
    if (!education) {
      return;
    }

    const { title, description, subtitle, range } = newEduObjRaw;
    if (!title || !description || !subtitle || !range) {
      return;
    }
    if (education.length <= index || index < 0) {
      return;
    }
    const newEducation = [...education];
    newEducation[index] = {
      school: title,
      degree: subtitle,
      fieldOfStudy: description,
      range,
    };
    setEducation(newEducation);
  }

  function handleAddEducationClick() {
    const newEducation = [...(education || [])];
    newEducation.push({
      school: "Your school",
      degree: "Your Degree",
      fieldOfStudy: "Major, description, etc.",
      range: { start: [1, 2000], end: [1, 2004] },
    });
    setEducation(newEducation);
  }

  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
        Education
      </p>
      <div style={{ marginLeft: 10 }}>
        {education?.map((edu, eduIndex) => {
          const { school, degree, fieldOfStudy, range } = edu;
          return (
            <ExperienceLikeSection
              key={`edu_${eduIndex}`}
              title={school}
              subtitle={degree}
              description={fieldOfStudy}
              range={range}
              onChange={(dat: ObjectAny) =>
                handleEducationOnChange(eduIndex, dat)
              }
            />
          );
        })}
        {/* <ExperienceLikeSection
          title={"University of Houston Downtown"}
          subtitle={"B.S."}
          description={"Computer Science"}
          range={{ start: [2, 2022], end: undefined }}
          onChange={(dat: ObjectAny) => handleEducationOnChange(0, dat)}
        /> */}
        {(!education || education.length == 0) && (
          <p style={{ margin: 0, opacity: 0.5 }}>No education</p>
        )}
      </div>
      <MinimalisticButton
        style={{ marginLeft: 10, fontSize: "0.8rem", marginTop: 5 }}
        onClick={handleAddEducationClick}
      >
        Add Education +
      </MinimalisticButton>
    </>
  );
}

function SocialSection({
  socials,
  setSocials,
}: {
  socials?: ObjectAny[];
  setSocials: AnyFunction;
}) {
  const dispatch = useDispatch();
  function handleAddSocialClick() {
    dispatch(
      setDialog({
        title: "Add Social",
        subtitle: "Choose an icon type and enter a url.",
        inputs: [
          {
            name: "icon",
            label: "Icon",
            type: "select",
            selectOptions: SocialTypes,
            initialValue: SocialTypes[0],
          },
          {
            name: "url",
            label: "Url",
            type: "text",
          },
        ],
        buttons: [
          {
            text: "Cancel",
          },
          {
            text: "Add",
            onClick: (params) => {
              handleAddSocialSubmit(params);
              dispatch(closeDialog());
            },
          },
        ],
      })
    );
  }

  async function handleEditSocialClick(sIndex: number) {
    await sleep(100);
    if (!socials) {
      return;
    }
    const currentSocial = socials[sIndex];
    if (!currentSocial) {
      return;
    }
    dispatch(
      setDialog({
        title: "Edit Social",
        inputs: [
          {
            name: "icon",
            label: "Icon",
            type: "select",
            selectOptions: SocialTypes,
            initialValue: currentSocial.type,
          },
          {
            name: "url",
            label: "Url",
            type: "text",
            initialValue: currentSocial.url,
          },
        ],
        buttons: [
          {
            text: "Cancel",
          },
          {
            text: "Confirm Changes",
            onClick: (params) => {
              handleEditSocialSubmit(params, sIndex);
              dispatch(closeDialog());
            },
          },
        ],
      })
    );
  }

  function handleAddSocialSubmit(payload: ObjectAny) {
    if (typeof payload != "object") {
      return;
    }
    const { url, icon } = payload;
    if (!url || !icon) {
      dispatch(
        setAlert({
          title: "Invalid Social",
          body: "Your social is missing a url or icon.",
        })
      );
      return;
    }
    const newSocial = { type: icon, url };
    setSocials(socials ? [...socials, newSocial] : [newSocial]);
  }

  function handleEditSocialSubmit(payload: ObjectAny, index: number) {
    if (!socials || index < 0 || socials.length <= index) {
      dispatch(
        setAlert({
          title: "Operation failed",
          body: "That social does not exist.",
        })
      );
      return;
    }
    const newSocials = [...socials];
    const { url, icon } = payload;
    const newSocial = { type: icon, url };
    newSocials[index] = newSocial;
    setSocials(newSocials);
  }

  function handleRemoveSocial(index: number) {
    if (!socials || index < 0 || socials.length <= index) {
      dispatch(
        setAlert({
          title: "Operation failed",
          body: "That social does not exist.",
        })
      );
      return;
    }
    const newSocials = [...socials];
    newSocials.splice(index, 1);
    setSocials(newSocials);
  }

  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>Socials</p>
      <div style={{ marginLeft: 10 }}>
        {socials?.map((social, socialIndex) => {
          const { type, url } = social;
          return (
            <SocialTile
              key={`social_${socialIndex}`}
              canRemove={true}
              onRemove={() => handleRemoveSocial(socialIndex)}
              canEdit={true}
              onEdit={() => handleEditSocialClick(socialIndex)}
              social={{ type: type, url: url }}
            />
          );
        })}
        {(!socials || socials.length == 0) && (
          <p style={{ margin: 0, opacity: 0.5 }}>No socials</p>
        )}
      </div>
      <MinimalisticButton
        onClick={handleAddSocialClick}
        style={{ marginTop: 5, marginLeft: 10, fontSize: "0.8rem" }}
      >
        Add Social +
      </MinimalisticButton>
    </>
  );
}

function BioSection({ bio, setBio }: { bio?: string; setBio?: AnyFunction }) {
  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>Bio</p>
      <textarea
        placeholder="Your bio"
        style={{
          margin: 0,
          fontSize: "1rem",
          padding: 10,
          borderRadius: 10,
          borderStartStartRadius: 0,
          marginLeft: 10,
          backgroundColor: "transparent",
          color: "white",
          minWidth: "10rem",
          minHeight: "1.2rem",
          maxWidth: "80%",
          maxHeight: "40vh",
          marginTop: 5,
          height: "4rem",
          width: "28rem",
        }}
        value={bio}
        onChange={(e) => setBio && setBio(e.target.value)}
        // disabled={disabled}
      />
    </>
  );
}

function SoftSkill({
  children,
  style,
  onClose,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onClose?: AnyFunction;
}) {
  return (
    <span
      style={{
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: "#444",
        borderRadius: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        ...style,
      }}
    >
      <span
        style={{
          fontSize: "0.8 rem"
        }}
      >
        {children}
      </span>
      <XIcon size={'1.25rem'} onClick={onClose} cursor={"pointer"} />
    </span>
  );
}

function MenteeRequestSection() {
  return <p>Mentee Request Sec</p>;
}

const CreateDateRangeDialogInputs = (
  startMonthIndex: number,
  startYear: number,
  endMonthIndex: number,
  endYear: number
): DialogInput[] => [
  {
    name: "startMonth",
    label: "Start Month",
    type: "select",
    selectOptions: Months,
    initialValue: getMonthName(startMonthIndex) || Months[0],
    inputStyle: { width: "10rem" },
  },
  {
    name: "startYear",
    label: "Start Year",
    type: "number",
    initialValue: startYear || 2000,
    containerStyle: { marginBottom: 30 },
    inputStyle: { width: "10rem" },
  },
  {
    name: "endMonth",
    label: "End Month",
    type: "select",
    selectOptions: Months,
    initialValue: getMonthName(endMonthIndex) || Months[0],
    inputStyle: { width: "10rem" },
  },
  {
    name: "endYear",
    label: "End Year",
    type: "number",
    initialValue: endYear || 2000,
    inputStyle: { width: "10rem" },
  },
  {
    name: "endIsCurrent",
    label: "End is Current?",
    type: "toggle",
    initialValue: !endYear,
    containerStyle: { marginBottom: 10 },
    inputStyle: { marginRight: 20 },
  },
];
function ExperienceLikeSection({
  title,
  subtitle,
  description,
  range,
  onChange,
}: {
  title?: string;
  subtitle?: string;
  description?: string;
  range?: ObjectAny;
  onChange?: AnyFunction;
}) {
  const dispatch = useDispatch();
  const { start, end } = range || {};

  const [startMonthIndex, startYear] = start || [null, null];
  const [endMonthIndex, endYear] = end || [null, null];

  function handleChangeSubmit(newExperienceLikeData: ObjectAny) {
    onChange && onChange(newExperienceLikeData);
  }

  function handleChangeRange() {
    dispatch(
      setDialog({
        title: `Change date range`,
        subtitle: `${title} ${subtitle}`,
        inputs: CreateDateRangeDialogInputs(
          startMonthIndex,
          startYear,
          endMonthIndex,
          endYear
        ),
        buttons: [
          {
            text: "Submit change",
            onClick: (params: ObjectAny) => {
              function AlertRangeError(msg: string) {
                dispatch(
                  setAlert({
                    title: "Invalid date range",
                    body: msg,
                  })
                );
              }
              const {
                startMonth,
                startYear: startYearRaw,
                endMonth,
                endYear: endYearRaw,
                endIsCurrent,
              } = params;

              const startYear = Number(startYearRaw);
              const endYear = Number(endYearRaw);

              const startMonthIndex = getMonthNumber(startMonth);

              let newObj: ObjectAny = {
                title,
                subtitle,
                description,
                range: {},
              };
              if (
                !startMonth ||
                !startYear ||
                typeof startMonthIndex != "number" ||
                typeof startYear != "number"
              ) {
                AlertRangeError("Start year or month is invalid");
                return;
              }

              newObj.range.start = [startMonthIndex, startYear];

              if (!endIsCurrent) {
                const endMonthIndex = getMonthNumber(endMonth);
                if (
                  !endMonthIndex ||
                  !endYear ||
                  typeof endMonthIndex != "number" ||
                  typeof endYear != "number"
                ) {
                  console.log(endMonthIndex, endYear);
                  AlertRangeError("End year or month is invalid");
                  return;
                }
                newObj.range.end = [endMonthIndex, endYear];
              }
              dispatch(closeDialog());
              handleChangeSubmit(newObj);
            },
          },
        ],
      })
    );
  }

  function handleChangeTitle(newTitle: string) {
    onChange && onChange({ title: newTitle, subtitle, description, range });
  }

  function handleChangeSubtitle(newSub: string) {
    onChange && onChange({ title, subtitle: newSub, description, range });
  }

  function handleChangeDescription(newDesc: string) {
    onChange && onChange({ title, subtitle, description: newDesc, range });
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <MinimalisticInput
          value={title}
          onChange={handleChangeTitle}
          style={{ fontWeight: "bold", minWidth: "0.5rem" }}
        />
        {subtitle && (
          <>
            <span style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
              |
            </span>
            <MinimalisticInput
              onChange={handleChangeSubtitle}
              style={{ minWidth: "1rem" }}
              value={subtitle}
            />
          </>
        )}
        {range && (
          <>
            <span style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
              |
            </span>
            <div
              style={{ borderBottom: "1px solid #fff4", cursor: "pointer" }}
              onClick={handleChangeRange}
            >
              <span>
                {getMonthName(start[0])} {Math.abs(start[1])}{" "}
                {start[1] < 0 ? "B.C." : ""}
              </span>
              <span>
                -{" "}
                {end
                  ? `${getMonthName(end[0])} ${Math.abs(end[1])} ${
                      end[1] < 0 ? "B.C." : ""
                    }`
                  : "Current"}
              </span>
            </div>
          </>
        )}

        <Pencil style={{ marginLeft: 5 }} size={"1rem"} />
      </div>
      <div style={{ marginLeft: 0 }}>
        <textarea
          placeholder="Your bio"
          style={{
            margin: 0,
            fontSize: "1rem",
            padding: 10,
            borderRadius: 10,
            borderStartStartRadius: 0,
            marginLeft: 10,
            backgroundColor: "transparent",
            color: "white",
            minWidth: "10rem",
            minHeight: "1.2rem",
            maxWidth: "80%",
            maxHeight: "40vh",
            marginTop: 5,
            height: "4rem",
            width: "28rem",
          }}
          value={description}
          onChange={(e) =>
            handleChangeDescription && handleChangeDescription(e.target.value)
          }
          // disabled={disabled}
        />
      </div>
    </div>
  );
}

// "instagram",
// "twitter",
// "youtube",
// "linkedIn",
// "discord",
function SocialTile({
  social,
  canRemove,
  onRemove,
  canEdit,
  onEdit,
}: {
  social: ObjectAny;
  canRemove?: boolean;
  onRemove?: AnyFunction;
  canEdit?: boolean;
  onEdit?: AnyFunction;
}) {
  const { type, url } = social;
  const dispatch = useDispatch();
  function HandleOpenSocial() {
    const btns: ObjectAny[] = [
      {
        text: "Go",
        onClick: () => {
          window.open(url, "_blank");
          dispatch(closeDialog());
        },
      },
    ];
    if (canRemove && onRemove) {
      btns.unshift({
        text: "Remove",
        style: { color: "white", backgroundColor: "#f33", marginRight: 10 },
        onClick: () => {
          onRemove();
          dispatch(closeDialog());
        },
      });
    }

    if (canEdit && onEdit) {
      btns.unshift({
        text: "Edit",
        onClick: () => {
          onEdit();
          dispatch(closeDialog());
        },
        style: { marginRight: 10 },
      });
    }
    dispatch(
      setDialog({
        title: `Opening ${canRemove || canEdit ? "or Editing" : ""} Social`,
        subtitle: `You to go to: \"${url}\".`,
        containerStyle: { minWidth: 400 },
        buttons: btns,
        buttonContainerStyle: {
          justifyContent: "end",
        },
      })
    );
  }
  const defaultIconStyle = { cursor: "pointer", marginRight: 5 };
  return (
    <>
      {type == "instagram" && (
        <Instagram
          size={30}
          onClick={HandleOpenSocial}
          style={defaultIconStyle}
        />
      )}
      {type == "twitter" && (
        <Twitter
          size={30}
          onClick={HandleOpenSocial}
          style={defaultIconStyle}
        />
      )}
      {type == "youtube" && (
        <Youtube
          size={30}
          strokeWidth={1.5}
          onClick={HandleOpenSocial}
          style={defaultIconStyle}
        />
      )}
      {type == "linkedIn" && (
        <FaLinkedin
          size={30}
          onClick={HandleOpenSocial}
          style={defaultIconStyle}
        />
      )}
      {type == "discord" && (
        <FaDiscord
          size={30}
          onClick={HandleOpenSocial}
          style={defaultIconStyle}
        />
      )}
    </>
  );
}
