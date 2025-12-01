import React from 'react';

type HelloProps = {
  name: string;
};

export function Hello({ name }: HelloProps) {
  return <h1>Hello, {name}!</h1>;
}