// import { useDispatch, useSelector } from "react-redux";
// import { ReduxRootState } from "../../store";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import React, { useEffect, useState } from "react";
// import {
//   ClientSocketUser,
//   MyClientSocket,
// } from "../../features/ClientSocket/ClientSocket";
// import {
//   AnyFunction,
//   MentorshipRequestObj,
//   MentorshipRequestResponseAction,
//   Months,
//   ObjectAny,
//   SocialTypes,
// } from "../../scripts/types";
// import {
//   Instagram,
//   Pencil,
//   Trash,
//   Twitter,
//   XIcon,
//   Youtube,
// } from "lucide-react";
// import { IoChatbubbleOutline } from "react-icons/io5";
// import {
//   closeDialog,
//   DialogInput,
//   setDialog,
// } from "../../features/Dialog/DialogSlice";
// import { FaDiscord, FaLinkedin } from "react-icons/fa";
// import { getMonthName, getMonthNumber, sleep } from "../../scripts/tools";
// import MinimalisticInput from "../../components/MinimalisticInput/MinimalisticInput";
// import MinimalisticButton from "../../components/MinimalisticButton/MinimalisticButton";
// import { setAlert } from "../../features/Alert/AlertSlice";
// import { useChangeUsernameWithDialog } from "../../hooks/UseChangeUsername";
// import { isMentorshipRequestResponseAction } from "../../scripts/validation";
// import { SaveButtonFixed } from "../../components/SaveButtonFixed/SaveButtonFixed";
// import MinimalisticTextArea from "../../components/MinimalisticTextArea/MinimalisticTextArea";
// import useChatWithUser from "../../hooks/UseChatWithUser/UseChatWithUser";

// export default function UserPage() {
//   const [changed, setChanged] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [params, _] = useSearchParams();
//   const navigate = useNavigate();
//   const id = params.get("id");

//   // TODO: add changedValues state to upload only changed values.
//   const [user, setUser] = useState<ClientSocketUser | undefined>(undefined);
//   const { ready, user: self } = useSelector(
//     (store: ReduxRootState) => store.ClientSocket
//   );
//   const dispatch = useDispatch();

//   const changeUsernameWithDialog = useChangeUsernameWithDialog();

//   function HandleChangeUsername() {
//     if (!CanMakeChanges) {
//       return;
//     }
//     changeUsernameWithDialog((v?: boolean, newUsername?: string) => {
//       if (!v || !newUsername) {
//         return;
//       }
//       setUser({
//         ...user,
//         username: newUsername,
//       });
//     });
//   }

//   function HandleSave() {
//     if (!changed || saving || !user) {
//       return;
//     }

//     dispatch(
//       setDialog({
//         title: "Update Profile",
//         subtitle:
//           "Saving overwrites current profile settings. Continue? (This cannot be undone)",
//         buttons: [
//           {
//             text: "Yes",
//             onClick: () => {
//               setSaving(true);
//               dispatch(closeDialog());
//               MyClientSocket?.updateProfile(
//                 { ...user, username: undefined },
//                 (v: boolean) => {
//                   setSaving(false);
//                   if (!v) {
//                     return;
//                   }
//                   setChanged(false);
//                   dispatch(
//                     setAlert({
//                       title: "Saved",
//                       body: "Successfully saved changes",
//                     })
//                   );
//                 }
//               );
//             },
//           },
//         ],
//         buttonContainerStyle: {
//           width: "100%",
//           display: "flex",
//           justifyContent: "end",
//         },
//       })
//     );
//   }

//   useEffect(() => {
//     async function GetUser() {
//       if (!id || !ready) {
//         return;
//       }

//       MyClientSocket?.GetUser(id, (d: unknown) => {
//         if (!d || typeof d != "object") {
//           return;
//         }
//         setUser(d);
//       });
//     }
//     GetUser();
//   }, [id, ready]);

//   function setName(fName: string, mName: string | undefined, lName: string) {
//     setUser({
//       ...user,
//       fName: fName.trim(),
//       mName: mName?.trim(),
//       lName: lName.trim(),
//     });
//     setChanged(true);
//   }

//   function setSocials(newSocials: ObjectAny[]) {
//     setUser({
//       ...user,
//       socials: newSocials,
//     });
//     setChanged(true);
//   }

//   function setBio(bio: string) {
//     if (bio.length > 200) {
//       bio = bio.substring(0, 200);
//     }
//     setUser({
//       ...user,
//       bio: bio,
//     });
//     setChanged(true);
//   }

//   function setEducation(newEducation: ObjectAny[]) {
//     setUser({
//       ...user,
//       education: newEducation,
//     });
//     setChanged(true);
//   }

//   function setCertifications(newCertifications: ObjectAny[]) {
//     setUser({
//       ...user,
//       certifications: newCertifications,
//     });
//     setChanged(true);
//   }

//   function setExperience(newExperience: ObjectAny[]) {
//     setUser({
//       ...user,
//       experience: newExperience,
//     });
//     setChanged(true);
//   }

//   function setProjects(newProjects: ObjectAny[]) {
//     setUser({
//       ...user,
//       projects: newProjects,
//     });
//     setChanged(true);
//   }

//   function setSoftSkills(newSoftSkills: string[]) {
//     setUser({
//       ...user,
//       softSkills: newSoftSkills,
//     });
//     setChanged(true);
//   }

//   if (!self) {
//     return <p>Waiting for your data...</p>;
//   }

//   if (!id) {
//     return <p>Uh oh, no id</p>;
//   }

//   if (!user) {
//     return <p>Loading...</p>;
//   }

//   const {
//     username,
//     fName,
//     mName,
//     lName,
//     socials,
//     experience,
//     education,
//     certifications,
//     projects,
//     softSkills,
//     isMentor, // @ts-ignore
//     isMentee,
//     acceptingMentees, // @ts-ignore
//     assessments, // @ts-ignore
//     DisplayPictureURL,
//     bio,
//   } = user;

//   const { id: selfUserID, mentorID: currentUserMentorID } = self;

//   const CanMakeChanges = selfUserID == id;
//   console.log("currentUser", user);
//   return (
//     <div
//       style={{
//         width: "100vw",
//         height: "100%",
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "start",
//         alignItems: "start",
//         backgroundColor: "#111",
//         flexDirection: "column",
//         padding: "2rem",
//         boxSizing: "border-box",
//       }}
//     >
//       {CanMakeChanges && (
//         <SaveButtonFixed
//           disabled={!CanMakeChanges}
//           saving={saving}
//           show={changed}
//           onSave={HandleSave}
//         />
//       )}
//       <div
//         style={{
//           maxWidth: 800,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "start",
//         }}
//       >
//         <MinimalisticButton
//           style={{
//             fontSize: "0.8rem",
//           }}
//           onClick={() => navigate("/app/home")}
//         >
//           {"<"} Home
//         </MinimalisticButton>
//         <div style={{ marginTop: 20 }} />
//         <NameSection
//           fName={fName}
//           mName={mName}
//           lName={lName}
//           setName={setName}
//           disabled={!CanMakeChanges}
//         />
//         <div
//           onClick={CanMakeChanges ? HandleChangeUsername : undefined}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             cursor: CanMakeChanges ? "pointer" : "default",
//           }}
//         >
//           <p
//             style={{
//               color: "white",
//               fontSize: "1rem",
//               margin: 0,
//               marginLeft: 10,
//               opacity: 0.5,
//             }}
//           >
//             aka {username}
//           </p>
//           {CanMakeChanges && (
//             <Pencil style={{ marginLeft: "0.5rem" }} size={"1rem"} />
//           )}
//         </div>

//         <ChatSection userIsSelf={CanMakeChanges} user={user} />

//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "start",
//             marginLeft: 10,
//           }}
//         >
//           <span style={{ fontSize: "1.1rem" }}>
//             {fName}
//             {fName?.charAt(fName.length - 1) == "s" ? "'" : "'s"} Stuff
//           </span>
//           <div style={{ display: "flex", marginLeft: 10, paddingTop: 5 }}>
//             <MinimalisticButton
//               style={{
//                 fontSize: "0.8rem",
//               }}
//               onClick={() =>
//                 navigate(`/app/assessments?id=${user.id}&origin=user`)
//               }
//             >
//               Assessments {">"}
//             </MinimalisticButton>
//             <MinimalisticButton
//               style={{
//                 marginLeft: 10,
//                 fontSize: "0.8rem",
//               }}
//               onClick={() => navigate(`/app/goals?id=${user.id}&origin=user`)}
//             >
//               Goals {">"}
//             </MinimalisticButton>
//           </div>
//         </div>
//         <RequestMentorSection
//           isMentor={isMentor}
//           acceptingMentees={acceptingMentees}
//           disabled={!CanMakeChanges}
//           isCurrentUserMentor={currentUserMentorID == id}
//           mentorData={user}
//         />
//         <AcceptMentorshipRequestSection user={user} />
//         <BioSection bio={bio} setBio={setBio} disabled={!CanMakeChanges} />
//         <SocialSection
//           socials={socials}
//           setSocials={setSocials}
//           disabled={!CanMakeChanges}
//         />
//         <EducationSection
//           education={education}
//           setEducation={setEducation}
//           disabled={!CanMakeChanges}
//         />
//         <CertificationSection
//           certifications={certifications}
//           setCertifications={setCertifications}
//           disabled={!CanMakeChanges}
//         />
//         <ExperienceSection
//           experience={experience}
//           setExperience={setExperience}
//           disabled={!CanMakeChanges}
//         />
//         <ProjectSection
//           projects={projects}
//           setProjects={setProjects}
//           disabled={!CanMakeChanges}
//         />
//         <SoftSkillSection
//           softSkills={softSkills}
//           setSoftSkills={setSoftSkills}
//           disabled={!CanMakeChanges}
//         />
//       </div>
//       <div style={{ height: "10vh" }} />
//     </div>
//   );
// }

// function ChatSection({
//   userIsSelf,
//   user,
// }: {
//   userIsSelf: boolean;
//   user: ClientSocketUser;
// }) {
//   const chatWithuser = useChatWithUser();
//   const { loaded } = useSelector((store: ReduxRootState) => store.Chat);
//   const { user: self } = useSelector(
//     (store: ReduxRootState) => store.ClientSocket
//   );
//   if (userIsSelf || !loaded || !self || !user) {
//     return;
//   }

//   function handleChatClick() {
//     if (!user || !user.id) {
//       return;
//     }
//     chatWithuser(user.id);
//   }

//   return (
//     <div style={{ marginLeft: 10, marginTop: 5 }}>
//       <MinimalisticButton
//         style={{ fontSize: "0.8rem", display: "flex", alignItems: "center" }}
//         onClick={handleChatClick}
//       >
//         Chat{" "}
//         <IoChatbubbleOutline
//           style={{ marginLeft: 5 }}
//           strokeWidth={4}
//           size={"1rem"}
//         />
//       </MinimalisticButton>
//     </div>
//   );
// }

// function NameSection({
//   fName,
//   mName,
//   lName,
//   setName,
//   disabled = true,
// }: {
//   fName?: string;
//   mName?: string;
//   lName?: string;
//   setName?: AnyFunction;
//   disabled?: boolean;
// }) {
//   function handleNameChange(fN?: string, mN?: string, lN?: string) {
//     if (disabled || !setName) {
//       return;
//     }
//     setName(fN || "", mN, lN || "");
//   }

//   return (
//     <div style={{ display: "flex", alignItems: "center" }}>
//       {/* <p
//       style={{
//         color: "white",
//         fontSize: "1.5rem",
//         margin: 0,
//         marginBottom: -5,
//       }}
//     >
//       {fName} {mName} {lName}
//     </p> */}
//       <MinimalisticInput
//         onChange={(val) => handleNameChange(val, mName, lName)}
//         disabled={disabled}
//         style={{
//           fontSize: "1.5rem",
//           minWidth: "1.25rem",
//           marginRight: "0.5rem",
//         }}
//         value={fName}
//       />
//       {(mName?.trim() || !disabled) && (
//         <MinimalisticInput
//           onChange={(val) => handleNameChange(fName, val, lName)}
//           disabled={disabled}
//           value={mName}
//           style={{
//             fontSize: "1.5rem",
//             minWidth: "1.25rem",
//             marginRight: "0.5rem",
//           }}
//         />
//       )}
//       <MinimalisticInput
//         onChange={(val) => handleNameChange(fName, mName, val)}
//         disabled={disabled}
//         value={lName}
//         style={{ fontSize: "1.5rem", minWidth: "1.25rem" }}
//       />
//       {!disabled && (
//         <Pencil size={"1.25rem"} style={{ marginLeft: "0.5rem" }} />
//       )}
//     </div>
//   );
// }

// function SoftSkillSection({
//   softSkills,
//   setSoftSkills,
//   disabled = true,
// }: {
//   softSkills?: string[];
//   setSoftSkills: AnyFunction;
//   disabled?: boolean;
// }) {
//   const [inputSS, setInputSS] = useState("");
//   const dispatch = useDispatch();
//   function handleAddSoftSkill() {
//     let softSkill = inputSS;
//     softSkill = softSkill.trim();
//     if (softSkill.length < 3) {
//       dispatch(
//         setAlert({
//           title: "Invalid soft skill",
//           body: "Soft skill is too short",
//         })
//       );
//       return;
//     }
//     const newSoftSkills = [...(softSkills || [])];
//     newSoftSkills.push(softSkill);
//     setSoftSkills(newSoftSkills);
//     setInputSS("");
//   }

//   function handleRemoveSoftSkill(sIndex: number) {
//     if (!softSkills || softSkills.length == 0) {
//       return;
//     }
//     const newSoftSkills = [...softSkills];
//     newSoftSkills.splice(sIndex, 1);
//     setSoftSkills(newSoftSkills);
//   }

//   return (
//     <>
//       <div style={{ display: "flex", alignItems: "center" }}>
//         <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
//           Soft Skills
//         </p>
//         {!disabled && <Pencil style={{ marginLeft: 5 }} size={"1rem"} />}
//       </div>
//       <div
//         style={{
//           marginLeft: 10,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "start",
//         }}
//       >
//         {softSkills && softSkills.length > 0 && (
//           <div
//             style={{
//               display: "flex",
//               padding: 5,
//               border: "1px solid #fff4",
//               borderRadius: 15,
//               marginBottom: 10,
//               flexWrap: "wrap",
//               maxWidth: "80vw",
//             }}
//           >
//             {softSkills?.map((softSkill, sIndex) => {
//               return (
//                 <SoftSkill
//                   onClose={() => handleRemoveSoftSkill(sIndex)}
//                   key={`sS_${sIndex}`}
//                   style={{ margin: 5 }}
//                   disabled={disabled}
//                 >
//                   {softSkill}
//                 </SoftSkill>
//               );
//             })}
//           </div>
//         )}
//         {(!softSkills || softSkills.length == 0) && (
//           <p style={{ margin: 0, opacity: 0.5 }}>No soft skills</p>
//         )}
//         {!disabled && (
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleAddSoftSkill();
//             }}
//             style={{ marginTop: 5, display: "flex" }}
//           >
//             <input
//               style={{
//                 backgroundColor: "transparent",
//                 fontSize: "1rem",
//                 border: "1px solid #fffd",
//                 padding: 5,
//                 paddingLeft: 10,
//                 width: "10rem",
//                 borderRadius: 10,
//                 color: "white",
//               }}
//               placeholder="Add soft skill"
//               value={inputSS}
//               onChange={(e) => setInputSS(e.target.value)}
//             />
//             <MinimalisticButton
//               style={{ marginLeft: "0.5rem", fontSize: "0.8rem" }}
//             >
//               Add Soft Skill +
//             </MinimalisticButton>
//           </form>
//         )}
//       </div>
//     </>
//   );
// }

// function ExperienceSection({
//   experience,
//   setExperience,
//   disabled = true,
// }: {
//   experience?: ObjectAny[];
//   setExperience?: AnyFunction;
//   disabled?: boolean;
// }) {
//   function handleExperienceChange(index: number, dat: ObjectAny) {
//     if (!setExperience || !experience) {
//       return;
//     }
//     const { title: company, subtitle: position, description, range } = dat;
//     const newExp = [...experience];
//     newExp[index] = { company, position, description, range };
//     setExperience(newExp);
//   }

//   function addExperience() {
//     if (!setExperience) {
//       return;
//     }
//     const newExp = [...(experience || [])];
//     newExp.push({
//       company: "Company name",
//       position: "position",
//       description: "Here's a description of your experience",
//       range: { start: [1, 2000], end: [1, 2004] },
//     });
//     setExperience(newExp);
//   }

//   function removeExperience(eIndex: number) {
//     if (!setExperience || !experience) {
//       return;
//     }
//     const newExp = [...experience];
//     newExp.splice(eIndex, 1);
//     setExperience(newExp);
//   }

//   return (
//     <>
//       <div style={{ display: "flex", alignItems: "center" }}>
//         <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
//           Experience
//         </p>

//         {!disabled && <Pencil style={{ marginLeft: 5 }} size={"1rem"} />}
//       </div>
//       <div style={{ marginLeft: 10 }}>
//         {experience?.map((experience, eIndex) => {
//           const { company, position, description, range } = experience;
//           return (
//             <ExperienceLikeSection
//               key={`exp_${eIndex}`}
//               title={company}
//               subtitle={position}
//               description={description}
//               range={range}
//               onChange={(dat: ObjectAny) => handleExperienceChange(eIndex, dat)}
//               disabled={disabled}
//               onDelete={() => removeExperience(eIndex)}
//             />
//           );
//         })}
//         {(!experience || experience.length == 0) && (
//           <p style={{ margin: 0, opacity: 0.5 }}>No experience</p>
//         )}
//       </div>
//       {!disabled && (
//         <MinimalisticButton
//           style={{ fontSize: "0.8rem", marginLeft: 10, marginTop: 5 }}
//           onClick={addExperience}
//         >
//           Add Experience +
//         </MinimalisticButton>
//       )}
//     </>
//   );
// }

// function ProjectSection({
//   projects,
//   setProjects,
//   disabled = true,
// }: {
//   projects?: ObjectAny[];
//   setProjects?: AnyFunction;
//   disabled?: boolean;
// }) {
//   function handleProjectChange(index: number, dat: ObjectAny) {
//     if (!setProjects || !projects) {
//       return;
//     }
//     const { title: name, subtitle: position, description, range } = dat;
//     const newExp = [...projects];
//     newExp[index] = { name, position, description, range };
//     setProjects(newExp);
//   }

//   function addProject() {
//     if (!setProjects) {
//       return;
//     }
//     const newExp = [...(projects || [])];
//     newExp.push({
//       name: "Project name",
//       position: "position",
//       description: "Here's a description of your project",
//       range: { start: [1, 2000], end: [1, 2004] },
//     });
//     setProjects(newExp);
//   }

//   function deleteProject(cIndex: number) {
//     if (!setProjects || !projects) {
//       return;
//     }
//     const newProjects = [...projects];
//     newProjects.splice(cIndex, 1);
//     setProjects(newProjects);
//   }

//   return (
//     <>
//       <div style={{ display: "flex", alignItems: "center" }}>
//         <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
//           Projects
//         </p>
//         {!disabled && <Pencil style={{ marginLeft: 5 }} size={"1rem"} />}
//       </div>
//       <div style={{ marginLeft: 10 }}>
//         {projects?.map((project, pIndex) => {
//           const { name, position, description, range } = project;
//           return (
//             <ExperienceLikeSection
//               key={`project_${pIndex}`}
//               title={name}
//               subtitle={position}
//               description={description}
//               range={range}
//               onChange={(dat: ObjectAny) => handleProjectChange(pIndex, dat)}
//               disabled={disabled}
//               onDelete={() => deleteProject(pIndex)}
//             />
//           );
//         })}
//         {(!projects || projects.length == 0) && (
//           <p style={{ margin: 0, opacity: 0.5 }}>No projects</p>
//         )}
//       </div>
//       {!disabled && (
//         <MinimalisticButton
//           style={{ fontSize: "0.8rem", marginLeft: 10, marginTop: 5 }}
//           onClick={addProject}
//         >
//           Add Project +
//         </MinimalisticButton>
//       )}
//     </>
//   );
// }

// function CertificationSection({
//   certifications,
//   setCertifications,
//   disabled = true,
// }: {
//   certifications?: ObjectAny[];
//   setCertifications?: AnyFunction;
//   disabled?: boolean;
// }) {
//   function handleCertificationChange(
//     cIndex: number,
//     newCertificationData: ObjectAny
//   ) {
//     if (!certifications || !setCertifications) {
//       return;
//     }
//     const newCerts = [...certifications];
//     const { title, subtitle } = newCertificationData;
//     newCerts[cIndex] = { name: title, issuingOrg: subtitle };
//     setCertifications(newCerts);
//   }

//   function handleAddCertification() {
//     if (!setCertifications) {
//       return;
//     }
//     const newCerts = [...(certifications || [])];
//     newCerts.push({
//       name: "New Certification",
//       issuingOrg: "Issuing Organization",
//     });
//     setCertifications && setCertifications(newCerts);
//   }

//   function deleteCertification(cIndex: number) {
//     if (!setCertifications || !certifications) {
//       return;
//     }
//     const newCerts = [...certifications];
//     newCerts.splice(cIndex, 1);
//     setCertifications(newCerts);
//   }

//   return (
//     <>
//       <div style={{ display: "flex", alignItems: "center" }}>
//         <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
//           Certifications
//         </p>
//         {!disabled && <Pencil style={{ marginLeft: 5 }} size={"1rem"} />}
//       </div>
//       <div style={{ marginLeft: 10 }}>
//         {certifications?.map((cert, cIndex) => {
//           const { name, issuingOrg } = cert;
//           return (
//             <ExperienceLikeSection
//               key={`cert_${cIndex}`}
//               title={name}
//               subtitle={issuingOrg}
//               onChange={(dat: ObjectAny) =>
//                 handleCertificationChange(cIndex, dat)
//               }
//               hideRange={true}
//               hideDescription={true}
//               disabled={disabled}
//               onDelete={() => deleteCertification(cIndex)}
//             />
//           );
//         })}
//         {(!certifications || certifications.length == 0) && (
//           <p style={{ margin: 0, opacity: 0.5 }}>No certifications</p>
//         )}
//       </div>
//       {!disabled && (
//         <MinimalisticButton
//           style={{ fontSize: "0.8rem", marginLeft: 10, marginTop: 5 }}
//           onClick={handleAddCertification}
//         >
//           Add Certification +
//         </MinimalisticButton>
//       )}
//     </>
//   );
// }

// function RequestMentorSection({
//   isMentor,
//   acceptingMentees,
//   isCurrentUserMentor,
//   mentorData,
//   disabled = true,
// }: {
//   isMentor?: boolean;
//   acceptingMentees?: boolean;
//   disabled?: boolean;
//   isCurrentUserMentor?: boolean;
//   mentorData: ClientSocketUser;
// }) {
//   const dispatch = useDispatch();
//   // TODO: Refactor structure of request mentor and mentee section
//   function handleRemoveMentor() {
//     if (!isCurrentUserMentor) {
//       return;
//     }

//     dispatch(
//       setDialog({
//         title: "Remove Mentor",
//         subtitle:
//           "This will remove this person as your mentor. Are you sure you want to do that?",
//         buttons: [
//           {
//             text: 'Remove Mentor',
//             useDisableTill: true,
//             onClick: (_, cb) => {
//               if (!MyClientSocket) {
//                 cb && cb();
//                 return;
//               }
//               MyClientSocket.RemoveMentor((v: boolean) => {
//                 cb && cb();
//                 dispatch(closeDialog());
//               });
//             }
//           }
//         ]
//       })
//     );
//   }

//   return (
//     <>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "start",
//           width: "auto",
//         }}
//       >
//         {isMentor ? (
//           acceptingMentees ? (
//             isCurrentUserMentor ? (
//               <MinimalisticButton onClick={handleRemoveMentor} style={{ fontSize: "1rem" }}>
//                 Remove Mentor
//               </MinimalisticButton>
//             ) : (
//               disabled && <MentorshipRequestSection mentorData={mentorData} />
//             )
//           ) : (
//             <span style={{ margin: 0 }}>Not accepting mentees</span>
//           )
//         ) : (
//           <span style={{ margin: 0 }}>Not a mentor</span>
//         )}
//       </div>
//     </>
//   );
// }

// function AcceptMentorshipRequestSection({ user }: { user: ClientSocketUser }) {
//   const { user: self, ready } = useSelector(
//     (store: ReduxRootState) => store.ClientSocket
//   );
//   const [params, _] = useSearchParams();
//   const id = params.get("id");
//   const [pendingMentorshipRequest, setPendingMentorshipRequest] = useState<
//     MentorshipRequestObj | undefined
//   >(undefined);
//   const [isMentee, setIsMentee] = useState(false);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (!MyClientSocket || !self || !self.id || !id || id == self.id) {
//       return;
//     }
//     MyClientSocket.GetMentorshipRequestBetweenMentorMentee(
//       self.id,
//       id,
//       (v: ObjectAny) => {
//         if (typeof v == "boolean") {
//           setPendingMentorshipRequest(undefined);
//           return;
//         }
//         setPendingMentorshipRequest(v);
//       }
//     );
//     const { menteeIDs } = self;
//     if (!menteeIDs || !menteeIDs.includes(id)) {
//       setIsMentee(false);
//     } else {
//       setIsMentee(true);
//     }
//   }, [self, ready, id]);

//   function handleAcceptMentorshipRequest() {
//     if (!pendingMentorshipRequest) {
//       return;
//     }
//     dispatch(
//       setDialog({
//         title: "Accept mentorship request",
//         subtitle: `${user.fName} ${user.lName} is requesting your mentorship`,
//         subTitleStyle: { minHeight: "3rem" },
//         buttons: [
//           {
//             text: "Decline",
//             onClick: (_, cb) => {
//               handleRespondToRequest("decline", cb);
//               dispatch(closeDialog());
//             },
//           },
//           {
//             text: "Accept",
//             onClick: (_, cb) => {
//               handleRespondToRequest("accept", cb);
//               dispatch(closeDialog());
//             },
//           },
//         ],
//         buttonContainerStyle: {
//           justifyContent: "space-between",
//           width: "100%",
//         },
//       })
//     );
//   }

//   function handleRespondToRequest(
//     response: MentorshipRequestResponseAction,
//     callback?: Function
//   ) {
//     if (
//       !isMentorshipRequestResponseAction(response) ||
//       !MyClientSocket ||
//       !pendingMentorshipRequest ||
//       !pendingMentorshipRequest.id
//     ) {
//       callback && callback(false);
//       console.log(
//         "handleRespondToRequest",
//         response,
//         pendingMentorshipRequest,
//         MyClientSocket
//       );
//       setTimeout(() => {
//         dispatch(
//           setAlert({ title: "Action failed", body: "Couldn't do that." })
//         );
//       }, 250);
//       return;
//     }

//     MyClientSocket.DoMentorshipRequestAction(
//       pendingMentorshipRequest.id,
//       response
//     );
//   }

//   if (!self || !MyClientSocket || !id) {
//     return;
//   }

//   if (pendingMentorshipRequest) {
//     return (
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           marginTop: 10,
//           marginLeft: 5,
//           marginBottom: 10,
//         }}
//       >
//         <p style={{ color: "#9ff", margin: 0, marginBottom: 5 }}>
//           This user is requesting your mentorship
//         </p>
//         <MinimalisticButton onClick={handleAcceptMentorshipRequest}>
//           View Mentorship Request
//         </MinimalisticButton>
//       </div>
//     );
//   } else if (isMentee) {
//     return (
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           marginTop: 0,
//           marginLeft: 5,
//         }}
//       >
//         <p style={{ color: "#9ff", margin: 0, marginBottom: 0 }}>
//           This is one of your mentees
//         </p>
//       </div>
//     );
//   }
// }

// function EducationSection({
//   education,
//   setEducation,
//   disabled = true,
// }: {
//   education?: ObjectAny[];
//   setEducation: AnyFunction;
//   disabled?: boolean;
// }) {
//   function handleEducationOnChange(index: number, newEduObjRaw: ObjectAny) {
//     if (!education) {
//       return;
//     }

//     const { title, description, subtitle, range } = newEduObjRaw;
//     if (!title || !description || !subtitle || !range) {
//       return;
//     }
//     if (education.length <= index || index < 0) {
//       return;
//     }
//     const newEducation = [...education];
//     newEducation[index] = {
//       school: title,
//       degree: subtitle,
//       fieldOfStudy: description,
//       range,
//     };
//     setEducation(newEducation);
//   }

//   function handleAddEducationClick() {
//     const newEducation = [...(education || [])];
//     newEducation.push({
//       school: "Your school",
//       degree: "Your Degree",
//       fieldOfStudy: "Major, description, etc.",
//       range: { start: [1, 2000], end: [1, 2004] },
//     });
//     setEducation(newEducation);
//   }

//   function deleteEducation(eduIndex: number) {
//     if (!education || !setEducation) {
//       return;
//     }
//     const newEducation = [...education];
//     newEducation.splice(eduIndex, 1);
//     setEducation(newEducation);
//   }

//   return (
//     <>
//       <div style={{ display: "flex", alignItems: "center" }}>
//         <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
//           Education
//         </p>
//         {!disabled && <Pencil style={{ marginLeft: 5 }} size={"1rem"} />}
//       </div>
//       <div style={{ marginLeft: 10 }}>
//         {education?.map((edu, eduIndex) => {
//           const { school, degree, fieldOfStudy, range } = edu;
//           return (
//             <ExperienceLikeSection
//               key={`edu_${eduIndex}`}
//               title={school}
//               subtitle={degree}
//               description={fieldOfStudy}
//               range={range}
//               onChange={(dat: ObjectAny) =>
//                 handleEducationOnChange(eduIndex, dat)
//               }
//               onDelete={() => deleteEducation(eduIndex)}
//               disabled={disabled}
//             />
//           );
//         })}
//         {/* <ExperienceLikeSection
//           title={"University of Houston Downtown"}
//           subtitle={"B.S."}
//           description={"Computer Science"}
//           range={{ start: [2, 2022], end: undefined }}
//           onChange={(dat: ObjectAny) => handleEducationOnChange(0, dat)}
//         /> */}
//         {(!education || education.length == 0) && (
//           <p style={{ margin: 0, opacity: 0.5 }}>No education</p>
//         )}
//       </div>
//       {!disabled && (
//         <MinimalisticButton
//           style={{ marginLeft: 10, fontSize: "0.8rem", marginTop: 5 }}
//           onClick={handleAddEducationClick}
//         >
//           Add Education +
//         </MinimalisticButton>
//       )}
//     </>
//   );
// }

// function SocialSection({
//   socials,
//   setSocials,
//   disabled = true,
// }: {
//   socials?: ObjectAny[];
//   setSocials: AnyFunction;
//   disabled?: boolean;
// }) {
//   const dispatch = useDispatch();
//   function handleAddSocialClick() {
//     dispatch(
//       setDialog({
//         title: "Add Social",
//         subtitle: "Choose an icon type and enter a url.",
//         inputs: [
//           {
//             name: "icon",
//             label: "Icon",
//             type: "select",
//             selectOptions: SocialTypes,
//             initialValue: SocialTypes[0],
//           },
//           {
//             name: "url",
//             label: "Url",
//             type: "text",
//           },
//         ],
//         buttons: [
//           {
//             text: "Cancel",
//           },
//           {
//             text: "Add",
//             onClick: (params) => {
//               handleAddSocialSubmit(params);
//               dispatch(closeDialog());
//             },
//           },
//         ],
//       })
//     );
//   }

//   async function handleEditSocialClick(sIndex: number) {
//     await sleep(100);
//     if (!socials) {
//       return;
//     }
//     const currentSocial = socials[sIndex];
//     if (!currentSocial) {
//       return;
//     }
//     dispatch(
//       setDialog({
//         title: "Edit Social",
//         inputs: [
//           {
//             name: "icon",
//             label: "Icon",
//             type: "select",
//             selectOptions: SocialTypes,
//             initialValue: currentSocial.type,
//           },
//           {
//             name: "url",
//             label: "Url",
//             type: "text",
//             initialValue: currentSocial.url,
//           },
//         ],
//         buttons: [
//           {
//             text: "Cancel",
//           },
//           {
//             text: "Confirm Changes",
//             onClick: (params) => {
//               handleEditSocialSubmit(params, sIndex);
//               dispatch(closeDialog());
//             },
//           },
//         ],
//       })
//     );
//   }

//   function handleAddSocialSubmit(payload: ObjectAny) {
//     if (typeof payload != "object") {
//       return;
//     }
//     const { url, icon } = payload;
//     if (!url || !icon) {
//       dispatch(
//         setAlert({
//           title: "Invalid Social",
//           body: "Your social is missing a url or icon.",
//         })
//       );
//       return;
//     }
//     const newSocial = { type: icon, url };
//     setSocials(socials ? [...socials, newSocial] : [newSocial]);
//   }

//   function handleEditSocialSubmit(payload: ObjectAny, index: number) {
//     if (!socials || index < 0 || socials.length <= index) {
//       dispatch(
//         setAlert({
//           title: "Operation failed",
//           body: "That social does not exist.",
//         })
//       );
//       return;
//     }
//     const newSocials = [...socials];
//     const { url, icon } = payload;
//     const newSocial = { type: icon, url };
//     newSocials[index] = newSocial;
//     setSocials(newSocials);
//   }

//   function handleRemoveSocial(index: number) {
//     if (!socials || index < 0 || socials.length <= index) {
//       dispatch(
//         setAlert({
//           title: "Operation failed",
//           body: "That social does not exist.",
//         })
//       );
//       return;
//     }
//     const newSocials = [...socials];
//     newSocials.splice(index, 1);
//     setSocials(newSocials);
//   }

//   return (
//     <>
//       <div style={{ display: "flex", alignItems: "center" }}>
//         <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>
//           Socials
//         </p>
//         {!disabled && <Pencil style={{ marginLeft: 5 }} size={"1rem"} />}
//       </div>
//       <div style={{ marginLeft: 10 }}>
//         {socials?.map((social, socialIndex) => {
//           const { type, url } = social;
//           return (
//             <SocialTile
//               key={`social_${socialIndex}`}
//               canRemove={!disabled}
//               onRemove={() => handleRemoveSocial(socialIndex)}
//               canEdit={!disabled}
//               onEdit={() => handleEditSocialClick(socialIndex)}
//               social={{ type: type, url: url }}
//             />
//           );
//         })}
//         {(!socials || socials.length == 0) && (
//           <p style={{ margin: 0, opacity: 0.5 }}>No socials</p>
//         )}
//       </div>
//       {!disabled && (
//         <MinimalisticButton
//           onClick={handleAddSocialClick}
//           style={{ marginTop: 5, marginLeft: 10, fontSize: "0.8rem" }}
//         >
//           Add Social +
//         </MinimalisticButton>
//       )}
//     </>
//   );
// }

// function BioSection({
//   bio,
//   setBio,
//   disabled = true,
// }: {
//   bio?: string;
//   setBio?: AnyFunction;
//   disabled?: boolean;
// }) {
//   return (
//     <>
//       <div style={{ display: "flex", alignItems: "center" }}>
//         <p style={{ color: "white", fontSize: "1.25rem", margin: 0 }}>Bio</p>
//         {!disabled && <Pencil style={{ marginLeft: 5 }} size={"1rem"} />}
//       </div>
//       {bio || !disabled ? (
//         <MinimalisticTextArea
//           placeholder={disabled ? "No bio" : "Your bio"}
//           style={{
//             marginLeft: 10,
//           }}
//           value={bio}
//           onChange={(v) => setBio && setBio(v)}
//           disabled={disabled}
//         />
//       ) : (
//         <p
//           style={{ fontSize: "1rem", margin: 0, marginLeft: 10, opacity: 0.5 }}
//         >
//           No bio
//         </p>
//       )}
//     </>
//   );
// }

// function SoftSkill({
//   children,
//   style,
//   onClose,
//   disabled = true,
// }: {
//   children?: React.ReactNode;
//   style?: React.CSSProperties;
//   onClose?: AnyFunction;
//   disabled?: boolean;
// }) {
//   return (
//     <span
//       style={{
//         padding: 5,
//         paddingLeft: 10,
//         paddingRight: 10,
//         backgroundColor: "#444",
//         borderRadius: 10,
//         display: "flex",
//         flexDirection: "row",
//         alignItems: "center",
//         ...style,
//       }}
//     >
//       <span
//         style={{
//           fontSize: "0.8 rem",
//         }}
//       >
//         {children}
//       </span>
//       {!disabled && (
//         <XIcon size={"1.25rem"} onClick={onClose} cursor={"pointer"} />
//       )}
//     </span>
//   );
// }

// function MentorshipRequestSection({
//   mentorData,
// }: {
//   mentorData: ClientSocketUser;
// }) {
//   const [requestExists, setRequestExists] = useState<boolean | undefined>(
//     undefined
//   );
//   const [requesting, setRequesting] = useState(false);
//   const [params, _] = useSearchParams();
//   const id = params.get("id");
//   const { user } = useSelector((store: ReduxRootState) => store.ClientSocket);
//   const dispatch = useDispatch();

//   function CheckStatus() {
//     if (!user || !id || !user.id || !MyClientSocket || id == user.id) {
//       return;
//     }
//     MyClientSocket.GetMentorshipRequestBetweenMentorMentee(
//       id,
//       user.id,
//       (v: ObjectAny | undefined) => {
//         setRequestExists(v ? true : false);
//       }
//     );
//   }

//   useEffect(() => {
//     CheckStatus();
//   }, [mentorData, user]);

//   if (!user || !id || id == user.id) {
//     return;
//   }

//   function handleRequestMentorshipClick() {
//     dispatch(
//       setDialog({
//         title: `Request Mentorship from ${mentorData.fName}`,
//         subtitle: `You sure you want to send a mentorship request to ${mentorData.fName} ${mentorData.lName}?`,
//         buttons: [
//           {
//             text: "Yes",
//             useDisableTill: true,
//             onClick: (_, enableCallback) => {
//               if (!MyClientSocket || !id) {
//                 return;
//               }

//               dispatch(closeDialog());
//               setRequesting(true);
//               MyClientSocket.SendMentorshipRequest(id, (v: boolean) => {
//                 setRequesting(false);
//                 enableCallback && enableCallback();
//                 if (v) {
//                   setTimeout(() => {
//                     dispatch(
//                       setAlert({
//                         title: "Request Sent!",
//                         body: `Your request has been set to ${user?.fName}`,
//                       })
//                     );
//                     setTimeout(() => {
//                       CheckStatus();
//                     }, 250);
//                   }, 250);
//                 }
//               });
//             },
//           },
//         ],
//       })
//     );
//   }

//   return (
//     <div
//       style={{
//         // padding: 10,
//         // borderRadius: 30,
//         // backgroundColor: "#444",
//         // border: "1px solid #fff2",
//         margin: 3,
//       }}
//     >
//       <MinimalisticButton
//         disabled={
//           requesting || requestExists || typeof requestExists == "undefined"
//         }
//         onClick={handleRequestMentorshipClick}
//         style={{ margin: 0, fontSize: "1rem" }}
//       >
//         {requesting
//           ? "Requesting Mentorship..."
//           : typeof requestExists == "undefined"
//           ? "Checking..."
//           : requestExists
//           ? "Request Sent"
//           : "Request Mentorship"}
//       </MinimalisticButton>
//     </div>
//   );
// }

// const CreateDateRangeDialogInputs = (
//   startMonthIndex: number,
//   startYear: number,
//   endMonthIndex: number,
//   endYear: number
// ): DialogInput[] => [
//   {
//     name: "startMonth",
//     label: "Start Month",
//     type: "select",
//     selectOptions: Months,
//     initialValue: getMonthName(startMonthIndex) || Months[0],
//     inputStyle: { width: "10rem" },
//   },
//   {
//     name: "startYear",
//     label: "Start Year",
//     type: "number",
//     initialValue: startYear || 2000,
//     containerStyle: { marginBottom: 30 },
//     inputStyle: { width: "10rem" },
//   },
//   {
//     name: "endMonth",
//     label: "End Month",
//     type: "select",
//     selectOptions: Months,
//     initialValue: getMonthName(endMonthIndex) || Months[0],
//     inputStyle: { width: "10rem" },
//   },
//   {
//     name: "endYear",
//     label: "End Year",
//     type: "number",
//     initialValue: endYear || 2000,
//     inputStyle: { width: "10rem" },
//   },
//   {
//     name: "endIsCurrent",
//     label: "End is Current?",
//     type: "toggle",
//     initialValue: !endYear,
//     containerStyle: { marginBottom: 10 },
//     inputStyle: { marginRight: 20 },
//   },
// ];
// function ExperienceLikeSection({
//   title,
//   subtitle,
//   description,
//   range,
//   hideTitle,
//   hideSubtitle,
//   hideDescription,
//   hideRange,
//   onChange,
//   disabled = true,
//   onDelete,
// }: {
//   title?: string;
//   subtitle?: string;
//   description?: string;
//   range?: ObjectAny;
//   onChange?: AnyFunction;
//   disabled?: boolean;
//   hideTitle?: boolean;
//   hideSubtitle?: boolean;
//   hideDescription?: boolean;
//   hideRange?: boolean;
//   onDelete: AnyFunction;
// }) {
//   const dispatch = useDispatch();
//   const { start, end } = range || {};

//   const [startMonthIndex, startYear] = start || [null, null];
//   const [endMonthIndex, endYear] = end || [null, null];

//   function handleChangeSubmit(newExperienceLikeData: ObjectAny) {
//     if (disabled) {
//       return;
//     }
//     onChange && onChange(newExperienceLikeData);
//   }

//   function handleChangeRange() {
//     if (disabled) {
//       return;
//     }
//     dispatch(
//       setDialog({
//         title: `Change date range`,
//         subtitle: `${title} ${subtitle}`,
//         inputs: CreateDateRangeDialogInputs(
//           startMonthIndex,
//           startYear,
//           endMonthIndex,
//           endYear
//         ),
//         buttons: [
//           {
//             text: "Submit change",
//             onClick: (params: ObjectAny) => {
//               function AlertRangeError(msg: string) {
//                 dispatch(
//                   setAlert({
//                     title: "Invalid date range",
//                     body: msg,
//                   })
//                 );
//               }
//               const {
//                 startMonth,
//                 startYear: startYearRaw,
//                 endMonth,
//                 endYear: endYearRaw,
//                 endIsCurrent,
//               } = params;

//               const startYear = Number(startYearRaw);
//               const endYear = Number(endYearRaw);

//               const startMonthIndex = getMonthNumber(startMonth);

//               let newObj: ObjectAny = {
//                 title,
//                 subtitle,
//                 description,
//                 range: {},
//               };
//               if (
//                 !startMonth ||
//                 !startYear ||
//                 typeof startMonthIndex != "number" ||
//                 typeof startYear != "number"
//               ) {
//                 AlertRangeError("Start year or month is invalid");
//                 return;
//               }

//               newObj.range.start = [startMonthIndex, startYear];

//               if (!endIsCurrent) {
//                 const endMonthIndex = getMonthNumber(endMonth);
//                 if (
//                   !endMonthIndex ||
//                   !endYear ||
//                   typeof endMonthIndex != "number" ||
//                   typeof endYear != "number"
//                 ) {
//                   console.log(endMonthIndex, endYear);
//                   AlertRangeError("End year or month is invalid");
//                   return;
//                 }
//                 newObj.range.end = [endMonthIndex, endYear];
//               }
//               dispatch(closeDialog());
//               handleChangeSubmit(newObj);
//             },
//           },
//         ],
//       })
//     );
//   }

//   function handleChangeTitle(newTitle: string) {
//     if (disabled) {
//       return;
//     }
//     onChange && onChange({ title: newTitle, subtitle, description, range });
//   }

//   function handleChangeSubtitle(newSub: string) {
//     if (disabled) {
//       return;
//     }
//     onChange && onChange({ title, subtitle: newSub, description, range });
//   }

//   function handleChangeDescription(newDesc: string) {
//     if (disabled) {
//       return;
//     }
//     onChange && onChange({ title, subtitle, description: newDesc, range });
//   }

//   return (
//     <div>
//       <div style={{ display: "flex", flexWrap: "wrap" }}>
//         {!hideTitle && (
//           <MinimalisticInput
//             value={title}
//             onChange={handleChangeTitle}
//             style={{ fontWeight: "bold", minWidth: "0.5rem" }}
//             disabled={disabled}
//           />
//         )}
//         {!hideSubtitle && (
//           <>
//             <span style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
//               |
//             </span>
//             <MinimalisticInput
//               onChange={handleChangeSubtitle}
//               style={{ minWidth: "1rem" }}
//               value={subtitle}
//               disabled={disabled}
//             />
//           </>
//         )}
//         {!hideRange && (
//           <>
//             <span style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
//               |
//             </span>
//             <div
//               style={{
//                 borderBottom: disabled ? "none" : "1px solid #fff4",
//                 cursor: !disabled ? "pointer" : "text",
//               }}
//               onClick={handleChangeRange}
//             >
//               {start && (
//                 <span>
//                   {getMonthName(start[0])} {Math.abs(start[1])}{" "}
//                   {start[1] < 0 ? "B.C." : start[1] < 1776 ? "A.D." : ""}
//                 </span>
//               )}
//               <span style={{ marginRight: "0.2rem" }}>-</span>
//               <span>
//                 {end
//                   ? `${getMonthName(end[0])} ${Math.abs(end[1])} ${
//                       end[1] < 0 ? "B.C." : end[1] < 1700 ? "A.D." : ""
//                     }`
//                   : "Current"}
//               </span>
//             </div>
//           </>
//         )}

//         {!disabled && (
//           <Trash
//             style={{ marginLeft: 5, cursor: "pointer" }}
//             size={"1.5rem"}
//             onClick={onDelete}
//           />
//         )}
//       </div>
//       {!hideDescription && (
//         <div style={{ marginLeft: 0 }}>
//           <textarea
//             placeholder="Your bio"
//             style={{
//               margin: 0,
//               fontSize: "1rem",
//               padding: 10,
//               borderRadius: 10,
//               borderStartStartRadius: 0,
//               marginLeft: 10,
//               backgroundColor: "transparent",
//               color: "white",
//               minWidth: "10rem",
//               minHeight: "1.2rem",
//               maxWidth: "80%",
//               maxHeight: "40vh",
//               marginTop: 5,
//               height: "4rem",
//               width: "28rem",
//             }}
//             value={description}
//             onChange={(e) =>
//               handleChangeDescription && handleChangeDescription(e.target.value)
//             }
//             disabled={disabled}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// // "instagram",
// // "twitter",
// // "youtube",
// // "linkedIn",
// // "discord",
// function SocialTile({
//   social,
//   canRemove,
//   onRemove,
//   canEdit,
//   onEdit,
// }: {
//   social: ObjectAny;
//   canRemove?: boolean;
//   onRemove?: AnyFunction;
//   canEdit?: boolean;
//   onEdit?: AnyFunction;
// }) {
//   const { type, url } = social;
//   const dispatch = useDispatch();
//   function HandleOpenSocial() {
//     const btns: ObjectAny[] = [
//       {
//         text: "Go",
//         onClick: () => {
//           window.open(url, "_blank");
//           dispatch(closeDialog());
//         },
//       },
//     ];
//     if (canRemove && onRemove) {
//       btns.unshift({
//         text: "Remove",
//         style: { color: "white", backgroundColor: "#f33", marginRight: 10 },
//         onClick: () => {
//           onRemove();
//           dispatch(closeDialog());
//         },
//       });
//     }

//     if (canEdit && onEdit) {
//       btns.unshift({
//         text: "Edit",
//         onClick: () => {
//           onEdit();
//           dispatch(closeDialog());
//         },
//         style: { marginRight: 10 },
//       });
//     }
//     dispatch(
//       setDialog({
//         title: `Opening ${canRemove || canEdit ? "or Editing" : ""} Social`,
//         subtitle: `You to go to: \"${url}\".`,
//         containerStyle: { minWidth: 400 },
//         buttons: btns,
//         buttonContainerStyle: {
//           justifyContent: "end",
//         },
//       })
//     );
//   }
//   const defaultIconStyle = { cursor: "pointer", marginRight: 5 };
//   return (
//     <>
//       {type == "instagram" && (
//         <Instagram
//           size={30}
//           onClick={HandleOpenSocial}
//           style={defaultIconStyle}
//         />
//       )}
//       {type == "twitter" && (
//         <Twitter
//           size={30}
//           onClick={HandleOpenSocial}
//           style={defaultIconStyle}
//         />
//       )}
//       {type == "youtube" && (
//         <Youtube
//           size={30}
//           strokeWidth={1.5}
//           onClick={HandleOpenSocial}
//           style={defaultIconStyle}
//         />
//       )}
//       {type == "linkedIn" && (
//         <FaLinkedin
//           size={30}
//           onClick={HandleOpenSocial}
//           style={defaultIconStyle}
//         />
//       )}
//       {type == "discord" && (
//         <FaDiscord
//           size={30}
//           onClick={HandleOpenSocial}
//           style={defaultIconStyle}
//         />
//       )}
//     </>
//   );
// }
