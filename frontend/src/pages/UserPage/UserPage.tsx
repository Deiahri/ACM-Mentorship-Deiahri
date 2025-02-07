import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { ReduxRootState } from "../../store";
import { useNavigate, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  ClientSocketUser,
  MyClientSocket,
} from "../../features/ClientSocket/ClientSocket";
import { AnyFunction, ObjectAny, SocialTypes } from "../../scripts/types";
import { Instagram, Twitter, XIcon, Youtube } from "lucide-react";
import { closeDialog, setDialog } from "../../features/Dialog/DialogSlice";
import { FaDiscord, FaLinkedin } from "react-icons/fa";
import { getMonthName, sleep } from "../../scripts/tools";
import MinimalisticInput from "../../components/MinimalisticInput/MinimalisticInput";
import MinimalisticButton from "../../components/MinimalisticButton/MinimalisticButton";
import { setAlert } from "../../features/Alert/AlertSlice";

export default function UserPage() {
  const [params, _] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");
  const [user, setUser] = useState<ClientSocketUser | undefined>(undefined);
  const { ready } = useSelector((store: ReduxRootState) => store.ClientSocket);

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
        padding: 20,
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
        <MentorSection
          isMentor={isMentor}
          acceptingMentees={acceptingMentees}
        />
        <BioSection />
        <SocialSection socials={socials} setSocials={setSocials} />
        <EducationSection education={education} />
        <CertificationSection certifications={certifications} />
        <EducationSection education={education} />
        <ExperienceSection experience={experience} />
        <ProjectSection projects={projects} />
        <SoftSkillSection softSkills={softSkills} />
      </div>
    </div>
  );
}

function SoftSkillSection({ softSkills }: { softSkills?: string[] }) {
  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
        Soft Skills
      </p>
      <div style={{ marginLeft: 10 }}>
        {softSkills?.map((softSkill) => {
          return <span>{softSkill}</span>;
        })}
        {(!softSkills || softSkills.length == 0) && (
          <p style={{ margin: 0, opacity: 0.5 }}>No soft skills</p>
        )}
        <div style={{ display: "flex" }}>
          <SoftSkill style={{ margin: 5 }}>Mega</SoftSkill>
          <SoftSkill style={{ margin: 5 }}>Lovania</SoftSkill>
        </div>
        <input
          style={{
            backgroundColor: "transparent",
            fontSize: "1rem",
            border: "1px solid #fff4",
            padding: 5,
            borderRadius: 10,
            color: "white",
          }}
          placeholder="Add soft skill"
        ></input>
      </div>
    </>
  );
}

function ExperienceSection({ experience }: { experience?: ObjectAny[] }) {
  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
        Experience
      </p>
      <div style={{ marginLeft: 10 }}>
        {experience?.map((experience) => {
          const { company, position, description, range } = experience;
          return (
            <ExperienceLikeSection
              title={company}
              subtitle={position}
              description={description}
              range={range}
            />
          );
        })}
        <ExperienceLikeSection
          title={"Microsoft"}
          subtitle={"CEO Executive"}
          description={
            "Did executive stuff around the world cause why not, screw you."
          }
          range={{ start: [2, 2022], end: undefined }}
        />
        {(!experience || experience.length == 0) && (
          <p style={{ margin: 0, opacity: 0.5 }}>No experience</p>
        )}
      </div>
    </>
  );
}

function ProjectSection({ projects }: { projects?: ObjectAny[] }) {
  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>Projects</p>
      <div style={{ marginLeft: 10 }}>
        {projects?.map((project) => {
          const { name, position, description, range } = project;
          return (
            <ExperienceLikeSection
              title={name}
              subtitle={position}
              description={description}
              range={range}
            />
          );
        })}
        <ExperienceLikeSection
          title={"Phoenix Mobile App Redesign"}
          subtitle={"Senior Front-End Developer"}
          description={
            "Led the front-end development (React Native) for a complete redesign of the Phoenix mobile app, focusing on performance optimization, improved user experience, and integration with new backend services. Implemented new features, including a personalized recommendation engine and an enhanced search functionality."
          }
          range={{ start: [9, 2023], end: [11, 2024] }}
        />
        {(!projects || projects.length == 0) && (
          <p style={{ margin: 0, opacity: 0.5 }}>No projects</p>
        )}
      </div>
    </>
  );
}

function CertificationSection({
  certifications,
}: {
  certifications?: ObjectAny[];
}) {
  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
        Certifications
      </p>
      <div style={{ marginLeft: 10 }}>
        {certifications?.map((cert) => {
          const { name, issuingOrg } = cert;
          return <ExperienceLikeSection title={name} subtitle={issuingOrg} />;
        })}
        <ExperienceLikeSection
          title={"Certified Cloud Security Architect"}
          subtitle={"Global Network Security Council (GNSC)"}
        />
        {(!certifications || certifications.length == 0) && (
          <p style={{ margin: 0, opacity: 0.5 }}>No certifications</p>
        )}
      </div>
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

function EducationSection({ education }: { education?: ObjectAny[] }) {
  return (
    <>
      <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
        Education
      </p>
      <div style={{ marginLeft: 10 }}>
        {education?.map((edu) => {
          const { school, degree, fieldOfStudy, range } = edu;
          return (
            <ExperienceLikeSection
              title={school}
              subtitle={degree}
              description={fieldOfStudy}
              range={range}
            />
          );
        })}
        <ExperienceLikeSection
          title={"University of Houston Downtown"}
          subtitle={"B.S."}
          description={"Computer Science"}
          range={{ start: [2, 2022], end: undefined }}
        />
        {(!education || education.length == 0) && (
          <p style={{ margin: 0, opacity: 0.5 }}>No education</p>
        )}
      </div>
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
            initialValue: currentSocial.url
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

function BioSection() {
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
        // value={answer}
        // onChange={(e) =>
        //   !disabled && updateAssessmentQuestion(index, question || "", e.target.value)
        // }
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
        backgroundColor: "#555",
        borderRadius: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        ...style,
      }}
    >
      <span>{children}</span>
      <XIcon onClick={onClose} cursor={"pointer"} />
    </span>
  );
}

function MenteeRequestSection() {
  return <p>Mentee Request Sec</p>;
}

function ExperienceLikeSection({
  title,
  subtitle,
  description,
  range,
}: {
  title?: string;
  subtitle?: string;
  description?: string;
  range?: ObjectAny;
}) {
  const { start, end } = range || {};
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <span style={{ fontWeight: "bold" }}>{title}</span>
        {subtitle && (
          <>
            <span style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
              |
            </span>
            <span>{subtitle}</span>
          </>
        )}
        {range && (
          <>
            <span style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
              |
            </span>
            <span>
              {getMonthName(start[0])} {start[1]}
            </span>
            <span>
              - {end ? `${getMonthName(end[0])} ${end[1]}` : "Current"}
            </span>
          </>
        )}
      </div>
      <div style={{ marginLeft: 10 }}>
        <span>{description}</span>
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
        style: {marginRight: 10}
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
