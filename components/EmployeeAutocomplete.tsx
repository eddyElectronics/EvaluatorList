'use client';

import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { Employee, SelectOption } from '@/lib/types';

interface EmployeeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  employees: Employee[];
  placeholder?: string;
  disabled?: boolean;
}

export default function EmployeeAutocomplete({
  value,
  onChange,
  employees,
  placeholder = 'เลือกพนักงาน',
  disabled = false,
}: EmployeeAutocompleteProps) {
  const options: SelectOption[] = useMemo(() => {
    return employees.map((emp) => ({
      value: emp.EMPL_CODE,
      label: `${emp.EMPL_CODE} - ${emp.TNAME}`,
    }));
  }, [employees]);

  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <Select
      value={selectedOption}
      onChange={(option) => onChange(option?.value || '')}
      options={options}
      placeholder={placeholder}
      isDisabled={disabled}
      isClearable
      isSearchable
      className="text-sm"
      classNamePrefix="select"
      filterOption={(option, inputValue) => {
        const searchValue = inputValue.toLowerCase();
        return (
          option.label.toLowerCase().includes(searchValue) ||
          option.value.toLowerCase().includes(searchValue)
        );
      }}
      styles={{
        control: (base) => ({
          ...base,
          minHeight: '38px',
          borderColor: '#d1d5db',
        }),
        menu: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        singleValue: (base) => ({
          ...base,
          color: '#000000',
        }),
        option: (base, state) => ({
          ...base,
          color: '#000000',
          backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#e5e7eb' : '#ffffff',
        }),
        input: (base) => ({
          ...base,
          color: '#000000',
        }),
        placeholder: (base) => ({
          ...base,
          color: '#6b7280',
        }),
      }}
    />
  );
}
