/*
 * This file is generated by jOOQ.
*/
package org.imperial.mrc.hint.db.tables.records;


import java.sql.Timestamp;

import javax.annotation.Generated;

import org.imperial.mrc.hint.db.tables.ProjectVersion;
import org.jooq.Field;
import org.jooq.Record1;
import org.jooq.Record7;
import org.jooq.Row7;
import org.jooq.impl.UpdatableRecordImpl;


/**
 * This class is generated by jOOQ.
 */
@Generated(
    value = {
        "http://www.jooq.org",
        "jOOQ version:3.10.5"
    },
    comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class ProjectVersionRecord extends UpdatableRecordImpl<ProjectVersionRecord> implements Record7<String, Integer, String, String, Timestamp, Timestamp, Boolean> {

    private static final long serialVersionUID = 443370361;

    /**
     * Setter for <code>public.project_version.id</code>.
     */
    public void setId(String value) {
        set(0, value);
    }

    /**
     * Getter for <code>public.project_version.id</code>.
     */
    public String getId() {
        return (String) get(0);
    }

    /**
     * Setter for <code>public.project_version.project_id</code>.
     */
    public void setProjectId(Integer value) {
        set(1, value);
    }

    /**
     * Getter for <code>public.project_version.project_id</code>.
     */
    public Integer getProjectId() {
        return (Integer) get(1);
    }

    /**
     * Setter for <code>public.project_version.state</code>.
     */
    public void setState(String value) {
        set(2, value);
    }

    /**
     * Getter for <code>public.project_version.state</code>.
     */
    public String getState() {
        return (String) get(2);
    }

    /**
     * Setter for <code>public.project_version.note</code>.
     */
    public void setNote(String value) {
        set(3, value);
    }

    /**
     * Getter for <code>public.project_version.note</code>.
     */
    public String getNote() {
        return (String) get(3);
    }

    /**
     * Setter for <code>public.project_version.created</code>.
     */
    public void setCreated(Timestamp value) {
        set(4, value);
    }

    /**
     * Getter for <code>public.project_version.created</code>.
     */
    public Timestamp getCreated() {
        return (Timestamp) get(4);
    }

    /**
     * Setter for <code>public.project_version.updated</code>.
     */
    public void setUpdated(Timestamp value) {
        set(5, value);
    }

    /**
     * Getter for <code>public.project_version.updated</code>.
     */
    public Timestamp getUpdated() {
        return (Timestamp) get(5);
    }

    /**
     * Setter for <code>public.project_version.deleted</code>.
     */
    public void setDeleted(Boolean value) {
        set(6, value);
    }

    /**
     * Getter for <code>public.project_version.deleted</code>.
     */
    public Boolean getDeleted() {
        return (Boolean) get(6);
    }

    // -------------------------------------------------------------------------
    // Primary key information
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Record1<String> key() {
        return (Record1) super.key();
    }

    // -------------------------------------------------------------------------
    // Record7 type implementation
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     */
    @Override
    public Row7<String, Integer, String, String, Timestamp, Timestamp, Boolean> fieldsRow() {
        return (Row7) super.fieldsRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Row7<String, Integer, String, String, Timestamp, Timestamp, Boolean> valuesRow() {
        return (Row7) super.valuesRow();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field1() {
        return ProjectVersion.PROJECT_VERSION.ID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Integer> field2() {
        return ProjectVersion.PROJECT_VERSION.PROJECT_ID;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field3() {
        return ProjectVersion.PROJECT_VERSION.STATE;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<String> field4() {
        return ProjectVersion.PROJECT_VERSION.NOTE;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Timestamp> field5() {
        return ProjectVersion.PROJECT_VERSION.CREATED;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Timestamp> field6() {
        return ProjectVersion.PROJECT_VERSION.UPDATED;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Field<Boolean> field7() {
        return ProjectVersion.PROJECT_VERSION.DELETED;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String component1() {
        return getId();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer component2() {
        return getProjectId();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String component3() {
        return getState();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String component4() {
        return getNote();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Timestamp component5() {
        return getCreated();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Timestamp component6() {
        return getUpdated();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Boolean component7() {
        return getDeleted();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value1() {
        return getId();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Integer value2() {
        return getProjectId();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value3() {
        return getState();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String value4() {
        return getNote();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Timestamp value5() {
        return getCreated();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Timestamp value6() {
        return getUpdated();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Boolean value7() {
        return getDeleted();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ProjectVersionRecord value1(String value) {
        setId(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ProjectVersionRecord value2(Integer value) {
        setProjectId(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ProjectVersionRecord value3(String value) {
        setState(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ProjectVersionRecord value4(String value) {
        setNote(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ProjectVersionRecord value5(Timestamp value) {
        setCreated(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ProjectVersionRecord value6(Timestamp value) {
        setUpdated(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ProjectVersionRecord value7(Boolean value) {
        setDeleted(value);
        return this;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ProjectVersionRecord values(String value1, Integer value2, String value3, String value4, Timestamp value5, Timestamp value6, Boolean value7) {
        value1(value1);
        value2(value2);
        value3(value3);
        value4(value4);
        value5(value5);
        value6(value6);
        value7(value7);
        return this;
    }

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /**
     * Create a detached ProjectVersionRecord
     */
    public ProjectVersionRecord() {
        super(ProjectVersion.PROJECT_VERSION);
    }

    /**
     * Create a detached, initialised ProjectVersionRecord
     */
    public ProjectVersionRecord(String id, Integer projectId, String state, String note, Timestamp created, Timestamp updated, Boolean deleted) {
        super(ProjectVersion.PROJECT_VERSION);

        set(0, id);
        set(1, projectId);
        set(2, state);
        set(3, note);
        set(4, created);
        set(5, updated);
        set(6, deleted);
    }
}