"use client";

import { useState, useEffect } from "react";
import { listCrmSettings, getCrmSettingById } from "@integration/services/crm-settings";
import type { CrmSetting } from "@integration/services/crm-settings/types";

export function useCrmVariables() {
  const [variables, setVariables] = useState<CrmSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await listCrmSettings();
      console.log("useCrmVariables client-side fetch result:", result);
      let data: CrmSetting[] = [];
      
      if (result.ok) {
        if (Array.isArray(result.data)) {
          data = result.data;
        } else if (result.data && typeof result.data === 'object') {
          const possibleArray = (result.data as any).data || (result.data as any).items || (result.data as any).settings || (result.data as any).docs;
          if (Array.isArray(possibleArray)) {
            data = possibleArray;
          }
        }
      }
      
      const specialtyId = "6a05e1f537c10d66e58aff55";
      const leadSourceId = "6a05eda937c10d66e58b0154";
      const educationLevelId = "6a0608f837c10d66e58b01da";
      const priorityId = "6a08697bc6c81845408ae446";
      
      // API returns _id as the primary key; id may be absent
      const resolveId = (v: CrmSetting) => v._id ?? v.id ?? "";
      
      const hasSpecialty = data.some(v => resolveId(v) === specialtyId);
      const hasLeadSource = data.some(v => resolveId(v) === leadSourceId);
      const hasEducationLevel = data.some(v => resolveId(v) === educationLevelId);
      const hasPriority = data.some(v => resolveId(v) === priorityId);
      
      if (!hasSpecialty) {
        const specResult = await getCrmSettingById(specialtyId);
        if (specResult.ok && specResult.data) {
          data.push(specResult.data);
        }
      }

      if (!hasLeadSource) {
        const leadResult = await getCrmSettingById(leadSourceId);
        if (leadResult.ok && leadResult.data) {
          data.push(leadResult.data);
        }
      }

      if (!hasEducationLevel) {
        const eduResult = await getCrmSettingById(educationLevelId);
        if (eduResult.ok && eduResult.data) {
          data.push(eduResult.data);
        }
      }

      if (!hasPriority) {
        const priorityResult = await getCrmSettingById(priorityId);
        if (priorityResult.ok && priorityResult.data) {
          data.push(priorityResult.data);
        }
      }

      setVariables(data);
    } catch {
    } finally {
      setLoading(false);
      // Mark as mounted AFTER data is loaded so consumers know the data is ready.
      // Setting this before the API call (the old behaviour) caused a race where
      // isMounted=true but variables was still [] — forms then wrongly fell back
      // to static seed values instead of the server-side props.
      setIsMounted(true);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const getOptionsById = (id: string) => {
    if (!variables || !Array.isArray(variables)) return [];
    
    // API returns _id as primary; id may be absent
    const variable = variables.find(v => (v._id ?? v.id ?? "") === id);
    if (!variable) {
      // Fallback: match by English name (tolerant) or exact Arabic name from the API
      if (id === "6a05e1f537c10d66e58aff55") {
        const byName = variables.find(v =>
          v.nameEn?.toLowerCase().includes("specialty") ||
          v.nameAr === "التخصص"
        );
        return byName?.options || [];
      }
      if (id === "6a05eda937c10d66e58b0154") {
        const byName = variables.find(v =>
          v.nameEn?.toLowerCase().includes("source") ||
          v.nameAr === "مصدر الليد"
        );
        return byName?.options || [];
      }
      if (id === "6a0608f837c10d66e58b01da") {
        const byName = variables.find(v =>
          v.nameEn?.toLowerCase().includes("education") ||
          v.nameAr === "مستوي التعليم"
        );
        return byName?.options || [];
      }
      if (id === "6a08697bc6c81845408ae446") {
        const byName = variables.find(v =>
          v.nameEn?.toLowerCase() === "status" ||
          v.nameAr === "حالة الليد"
        );
        return byName?.options || [];
      }
    }
    return variable?.options || [];
  };

  const getOptionsByName = (nameEn: string) => {
    return variables.find(v => v.nameEn === nameEn)?.options || [];
  };

  return { variables, loading, isMounted, refresh, getOptions: getOptionsByName, getOptionsById };
}
