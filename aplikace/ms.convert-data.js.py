#!/usr/bin/env python
# coding=utf-8

import logging
import uuid as uuid_generator

from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlmodel import Field, SQLModel, Session, create_engine, select
import sqlalchemy as sa

sqlmode_engine = create_engine("sqlite:///gathered_cuzk.db", echo=False) # Vytvoření dočastné databázy pro data z ČUZK

from sqlalchemy.orm import sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sqlmode_engine)

class DbCadastralArea(SQLModel, table=True):
    __tablename__ = "db_cadastral_area"

    uuid: uuid_generator.UUID = Field(default_factory=uuid_generator.uuid4, primary_key=True)
    code: int   = Field(nullable=False, index=True, description="CUZK identification code of cadastral area")
    name: str   = Field(nullable=False, index=True, description="Cadastral area name from CUZK, based on real life area names")
    epsg: str   = Field(nullable=False, description="Cadastral area data EPSG")
    size: Optional[int] = Field(nullable=True, description="Size in bytes, column used for comparing if data has changed or not")
    coordinates: Optional[List[float]]= Field(sa_column=sa.Column(sa.JSON, nullable=True), description="Polygons of this cadastral area")

    updated_at: Optional[datetime] = Field(sa_column=sa.Column(sa.DateTime(timezone=True), nullable=True), default=None, 
                                           description="Timedate when the data was uploaded to CUZK server for public use")
    created_at: Optional[datetime] = Field(default=None,sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
                                           description="Time when area was first uploaded to local db")
    
    def is_finite(self) -> bool: return all([self.code, self.name])
    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()
    
    def __repr__(self):
        return f"DbCadastralArea(code={self.code}, name={self.name}, size={self.size}, updated_at={self.updated_at})"

def create_db_and_tables():
    # Vytvoření datové struktury pro SQLModel.metadata
    SQLModel.metadata.create_all(sqlmode_engine)
    logging.getLogger("pydantic").setLevel(logging.ERROR) # Zabránění spamu z konzole, zobrazení pouze nezbytných chyb

if __name__ == "__main__":
    with Session(sqlmode_engine) as engine:
        areas = engine.exec(select(DbCadastralArea)).all()
        list_area = [f"{area.name}; [{area.code}]" for area in areas]
        with open("areas.cuzkl", "w", encoding="utf-8") as f:
            f.write(str(list_area))