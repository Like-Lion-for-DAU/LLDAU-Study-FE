import { members } from "./members";
import{useState} from "react";

const emptyForm = {
  name: "",
  part: "",
  skills: "",
  intro: "",
  detail: "",
  email: "",
  phone: "",
  web: "",
  tell: "",
};

export function handleDeleteLast(members, setMembers) {
    if (members.length === 0) return;
    setMembers((prev) => prev.slice(0, -1));
}

export function toggleForm() {
    if(document.getElementById("formSection").style.display === "none") {
        document.getElementById("formSection").style.display = "block"
    } 
    else {
        document.getElementById("formSection").style.display = "none"
    }
}

export function handleCancle() {
    document.getElementById("formSection").style.display = "none";
}