"use client";

import { useTransition } from "react";
import { deleteCourse } from "./actions";

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this course?")) {
      startTransition(async () => {
        await deleteCourse(courseId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      style={{
        background: "transparent",
        color: "#ef4444",
        border: "1px solid #ef4444",
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
        cursor: "pointer",
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
