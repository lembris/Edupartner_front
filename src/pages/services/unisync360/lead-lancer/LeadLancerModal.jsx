import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input } from "reactstrap";

export const LeadLancerModal = ({ isOpen, toggle, selectedLeadLancer, onSave }) => {
    const [formData, setFormData] = React.useState(selectedLeadLancer || {});

    React.useEffect(() => {
        if (selectedLeadLancer) {
            setFormData(selectedLeadLancer);
        }
    }, [selectedLeadLancer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        onSave(formData);
        toggle();
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                {selectedLeadLancer?.id ? "Edit Lead Lancer" : "Add Lead Lancer"}
            </ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="name">Name</Label>
                    <Input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Enter name"
                        value={formData.name || ""}
                        onChange={handleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="email">Email</Label>
                    <Input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Enter email"
                        value={formData.email || ""}
                        onChange={handleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="phone">Phone</Label>
                    <Input
                        type="text"
                        name="phone"
                        id="phone"
                        placeholder="Enter phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                    />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleSubmit}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};
