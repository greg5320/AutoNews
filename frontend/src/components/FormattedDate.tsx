"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface FormattedDateProps {
  date: string;
  pattern?: string;
}

export function FormattedDate({ date, pattern = "d MMMM yyyy, HH:mm" }: FormattedDateProps) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    try {
      const d = new Date(date);
      setFormatted(format(d, pattern, { locale: ru }));
    } catch (e) {
      setFormatted(date);
    }
  }, [date, pattern]);

  if (!formatted) {
    return <span className="opacity-50">...</span>;
  }

  return <span>{formatted}</span>;
}
